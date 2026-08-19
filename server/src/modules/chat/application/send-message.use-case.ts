import { Response } from "express";
import { IConversationsRepository } from "../../../infrastructure/repositories/conversations/conversations.repository.interface.ts";
import { IMessagesRepository } from "../../../infrastructure/repositories/messages/messages.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { IRetrievalService } from "../../../shared/services/retrieval/retrieval.service.interface.ts";
import { ILlmService } from "../../../infrastructure/external-services/llm/llm.external-service.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError } from "../../../shared/core/api-error.ts";
import { aiConfig } from "../../../shared/config/ai.config.ts";
import { LlmMessage } from "../../../infrastructure/external-services/llm/llm.types.ts";
import { SourceReference } from "../../../infrastructure/repositories/messages/messages.types.ts";
import { SendMessageRequestDto, SendMessageSourceDto } from "./dtos/send-message.dto.ts";

export class SendMessageUseCase {
  constructor(
    private readonly conversationsRepository: IConversationsRepository,
    private readonly messagesRepository: IMessagesRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly sourcesRepository: ISourcesRepository,
    private readonly retrievalService: IRetrievalService,
    private readonly llmService: ILlmService,
    private readonly idService: IIdService,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: SendMessageRequestDto, res: Response): Promise<void> {
    const { notebookId, userId, message } = dto;

    // 1. Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(notebookId, userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    // 2. Resolve or create conversation
    let conversationId = dto.conversationId;
    let isNewConversation = false;

    if (!conversationId) {
      conversationId = this.idService.generate();
      await this.conversationsRepository.create(conversationId, notebookId, userId);
      isNewConversation = true;
    } else {
      const existing = await this.conversationsRepository.findByIdAndUserId(conversationId, userId);
      if (!existing || existing.notebook_id !== notebookId) {
        throw new NotFoundError("Conversation not found");
      }
    }

    // 3. Persist user message
    const userMessageId = this.idService.generate();
    await this.messagesRepository.create({
      id: userMessageId,
      conversationId,
      notebookId,
      role: "user",
      content: message,
    });
    await this.conversationsRepository.incrementMessageCount(conversationId);

    // 4. Retrieve relevant chunks via RAG
    let retrievedChunks: { id: string; sourceId: string; content: string; chunkIndex: number; tokenCount: number; similarity: number }[] = [];
    try {
      retrievedChunks = await this.retrievalService.retrieveRelevantChunks(notebookId, message);
    } catch (error) {
      this.logger.error("RAG retrieval failed", { notebookId, error: (error as Error).message });
      retrievedChunks = [];
    }

    const sourcesUsed: SendMessageSourceDto[] = retrievedChunks.map((chunk) => ({
      sourceId: chunk.sourceId,
      chunkId: chunk.id,
      similarity: chunk.similarity,
      content: chunk.content,
    }));

    // 5. Build system prompt with RAG context
    const systemPrompt = this.buildSystemPrompt(sourcesUsed);

    // 6. Get conversation history (recent messages)
    const recentMessages = await this.messagesRepository.getRecentMessages(
      conversationId,
      aiConfig.conversation.recentMessageWindow
    );

    // Build LLM message history (exclude the user message we just saved — it's the current query)
    const historyMessages: LlmMessage[] = recentMessages
      .filter((m) => m.id !== userMessageId)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Add current user message
    historyMessages.push({ role: "user", content: message });

    // 7. Set up SSE response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Send metadata event
    const assistantMessageId = this.idService.generate();
    this.sendSSE(res, "metadata", { conversationId, messageId: assistantMessageId });

    // Send sources event (deduplicated by source, with title)
    if (sourcesUsed.length > 0) {
      // Get unique source IDs and look up their titles
      const uniqueSourceIds = [...new Set(sourcesUsed.map((s) => s.sourceId))];
      const sourcesTitlesMap = new Map<string, string>();
      for (const sid of uniqueSourceIds) {
        const src = await this.sourcesRepository.findById(sid);
        if (src) sourcesTitlesMap.set(sid, src.title);
      }

      // Group by source: pick the best similarity per source
      const groupedSources = uniqueSourceIds.map((sid) => {
        const chunks = sourcesUsed.filter((s) => s.sourceId === sid);
        const bestChunk = chunks.reduce((best, c) => c.similarity > best.similarity ? c : best, chunks[0]);
        return {
          sourceId: sid,
          title: sourcesTitlesMap.get(sid) || "Unknown source",
          similarity: bestChunk.similarity,
          chunkCount: chunks.length,
          content: bestChunk.content.slice(0, 200),
        };
      });

      this.sendSSE(res, "sources", groupedSources);
    }

    // 8. Stream LLM response
    let fullContent = "";
    const model = notebook.aiModel || aiConfig.chat.defaultModel;

    await this.llmService.streamChat({
      model,
      systemPrompt,
      messages: historyMessages,
      onChunk: (text) => {
        fullContent += text;
        this.sendSSE(res, "chunk", { text });
      },
      onFinish: async (result) => {
        // 9. Persist assistant message
        const sourceRefs: SourceReference[] = sourcesUsed.map((s) => ({
          sourceId: s.sourceId,
          chunkId: s.chunkId,
          similarity: s.similarity,
        }));

        await this.messagesRepository.create({
          id: assistantMessageId,
          conversationId: conversationId!,
          notebookId,
          role: "assistant",
          content: fullContent,
          sourcesUsed: sourceRefs.length > 0 ? sourceRefs : null,
          tokenCount: result.totalTokens,
        });

        await this.conversationsRepository.incrementMessageCount(conversationId!);

        // Auto-generate title for new conversations
        if (isNewConversation) {
          const title = this.generateTitle(message);
          await this.conversationsRepository.updateTitle(conversationId!, title);
        }

        this.sendSSE(res, "done", { totalTokens: result.totalTokens });
        res.end();
      },
      onError: (error) => {
        this.logger.error("LLM stream error", { conversationId, error: error.message });
        this.sendSSE(res, "error", { message: "Failed to generate response" });
        res.end();
      },
    });
  }

  private buildSystemPrompt(sources: SendMessageSourceDto[]): string {
    let prompt = `You are an AI assistant for a research notebook. Answer questions based on the provided source material.

## Instructions
- Answer based on the provided sources when relevant
- Cite sources naturally when referencing specific information
- If the sources don't contain enough information to answer fully, say so and provide what you can
- Be concise, accurate, and helpful
- Use markdown formatting for better readability`;

    if (sources.length > 0) {
      prompt += `\n\n## Source Context\n`;
      sources.forEach((source, index) => {
        prompt += `\n[Source ${index + 1}]\n${source.content}\n`;
      });
    } else {
      prompt += `\n\n## Note\nNo relevant source chunks were found for this query. Let the user know that their question doesn't seem to match the available sources.`;
    }

    return prompt;
  }

  private generateTitle(message: string): string {
    // Simple title generation — take first ~50 chars of the user message
    const cleaned = message.replace(/\n/g, " ").trim();
    if (cleaned.length <= 50) return cleaned;
    return cleaned.slice(0, 47) + "...";
  }

  private sendSSE(res: Response, event: string, data: unknown): void {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}
