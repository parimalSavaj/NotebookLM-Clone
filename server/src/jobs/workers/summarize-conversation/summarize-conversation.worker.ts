import { IConversationsRepository } from "../../../infrastructure/repositories/conversations/conversations.repository.interface.ts";
import { IMessagesRepository } from "../../../infrastructure/repositories/messages/messages.repository.interface.ts";
import { ILlmService } from "../../../infrastructure/external-services/llm/llm.external-service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NonRetryableError } from "../../../shared/core/job-errors.ts";
import { aiConfig } from "../../../shared/config/ai.config.ts";
import { SummarizeConversationPayload, SummarizeConversationResult } from "./summarize-conversation.types.ts";

export class SummarizeConversationWorker {
  constructor(
    private readonly conversationsRepository: IConversationsRepository,
    private readonly messagesRepository: IMessagesRepository,
    private readonly llmService: ILlmService,
    private readonly logger: ILoggerService
  ) {}

  async execute(payload: SummarizeConversationPayload): Promise<SummarizeConversationResult> {
    const { conversationId } = payload;

    this.logger.info("Summarize conversation job started", { conversationId });

    // 1. Load conversation to get existing summary
    const conversation = await this.conversationsRepository.findById(conversationId);
    if (!conversation) {
      throw new NonRetryableError(`Conversation ${conversationId} not found — may have been deleted`);
    }

    const existingSummary = conversation.summary;

    // 2. Fetch only the recent batch of messages (since last summary)
    // On first summary (no existing summary), fetch all messages.
    // On subsequent summaries, fetch only the last summaryInterval messages (the new batch).
    let messages;
    if (existingSummary) {
      messages = await this.messagesRepository.getRecentMessages(
        conversationId,
        aiConfig.conversation.summaryInterval
      );
    } else {
      messages = await this.messagesRepository.findByConversationId(conversationId);
    }

    if (messages.length === 0) {
      throw new NonRetryableError(`Conversation ${conversationId} has no messages to summarize`);
    }

    // Build the conversation text to summarize
    const messagesToSummarize = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");

    // 3. Build summarization prompt
    const systemPrompt = this.buildSummarizationPrompt(existingSummary);

    // 4. Call LLM to generate summary
    const result = await this.llmService.generateText({
      model: aiConfig.chat.defaultModel,
      systemPrompt,
      messages: [
        {
          role: "user",
          content: messagesToSummarize,
        },
      ],
    });

    const newSummary = result.text.trim();

    if (!newSummary) {
      this.logger.error("LLM returned empty summary", { conversationId });
      throw new Error("LLM returned empty summary for conversation");
    }

    // 5. Persist the summary
    await this.conversationsRepository.updateSummary(conversationId, newSummary);

    this.logger.info("Summarize conversation job completed", {
      conversationId,
      summaryLength: newSummary.length,
      totalTokens: result.totalTokens,
      incremental: !!existingSummary,
      messagesBatch: messages.length,
    });

    return { conversationId, summaryLength: newSummary.length };
  }

  private buildSummarizationPrompt(existingSummary: string | null): string {
    if (existingSummary) {
      return `You are a conversation summarizer. Your job is to update an existing conversation summary with new messages.

## Instructions
- You are given the current summary of the conversation so far, plus a batch of new messages
- Merge the new information into the existing summary to produce a single updated summary
- Capture key topics discussed, questions asked, and answers provided
- Preserve important facts, decisions, and conclusions from both the existing summary and new messages
- Keep the summary concise — aim for 200-400 words
- Write in third person (e.g., "The user asked about...", "The assistant explained...")
- Focus on information that would be useful context for continuing the conversation
- Do NOT simply append — create a cohesive, well-organized summary

## Existing Summary
${existingSummary}

## Task
Incorporate the following new messages into the summary above and produce an updated summary:`;
    }

    return `You are a conversation summarizer. Your job is to create a concise but comprehensive summary of the conversation provided.

## Instructions
- Capture the key topics discussed, questions asked, and answers provided
- Preserve important facts, decisions, and conclusions
- Keep the summary concise — aim for 200-400 words
- Write in third person (e.g., "The user asked about...", "The assistant explained...")
- Focus on information that would be useful context for continuing the conversation

## Task
Summarize the following conversation messages into a single cohesive summary:`;
  }
}
