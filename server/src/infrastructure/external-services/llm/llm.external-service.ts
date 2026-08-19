import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";
import { ILlmService } from "./llm.external-service.interface.ts";
import { LlmMessage, LlmGenerateResult } from "./llm.types.ts";

export class LlmExternalService implements ILlmService {
  private static instance: LlmExternalService | null = null;
  private readonly provider;

  private constructor(apiKey: string) {
    this.provider = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
  }

  static getInstance(apiKey: string): LlmExternalService {
    if (!LlmExternalService.instance) {
      LlmExternalService.instance = new LlmExternalService(apiKey);
    }
    return LlmExternalService.instance;
  }

  async streamChat(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
    onChunk: (text: string) => void;
    onFinish: (result: { totalTokens: number; finishReason: string }) => void;
    onError: (error: Error) => void;
    abortSignal?: AbortSignal;
  }): Promise<void> {
    const { model, systemPrompt, messages, onChunk, onFinish, onError, abortSignal } = params;

    try {
      const result = streamText({
        model: this.provider(model),
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        abortSignal,
      });

      let totalTokens = 0;
      let finishReason = "stop";

      for await (const chunk of result.textStream) {
        onChunk(chunk);
      }

      // Get usage after stream completes
      const usage = await result.usage;
      totalTokens = (usage?.totalTokens) ?? 0;

      const reason = await result.finishReason;
      finishReason = reason ?? "stop";

      onFinish({ totalTokens, finishReason });
    } catch (error) {
      onError(error as Error);
    }
  }

  async generateText(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
  }): Promise<LlmGenerateResult> {
    const { model, systemPrompt, messages } = params;

    const result = await generateText({
      model: this.provider(model),
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    });

    return {
      text: result.text,
      totalTokens: result.usage?.totalTokens ?? 0,
      finishReason: result.finishReason ?? "stop",
    };
  }
}
