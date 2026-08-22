import { createOpenRouter, type OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { streamText, generateText, isStepCount } from "ai";
import { z } from "zod/v4";
import { ILlmService, LlmToolDefinition } from "./llm.external-service.interface.ts";
import { LlmMessage, LlmGenerateResult, LlmToolResult } from "./llm.types.ts";

export class OpenRouterExternalService implements ILlmService {
  private static instance: OpenRouterExternalService | null = null;
  private readonly provider: OpenRouterProvider;

  private constructor(apiKey: string) {
    this.provider = createOpenRouter({ apiKey });
  }

  static getInstance(apiKey: string): OpenRouterExternalService {
    if (!OpenRouterExternalService.instance) {
      OpenRouterExternalService.instance = new OpenRouterExternalService(apiKey);
    }
    return OpenRouterExternalService.instance;
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

  async streamChatWithTools(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
    tools: Record<string, LlmToolDefinition>;
    onChunk: (text: string) => void;
    onToolResult: (result: LlmToolResult) => void;
    onFinish: (result: { totalTokens: number; finishReason: string }) => void;
    onError: (error: Error) => void;
    abortSignal?: AbortSignal;
  }): Promise<void> {
    const { model, systemPrompt, messages, tools: toolDefs, onChunk, onToolResult, onFinish, onError, abortSignal } = params;

    try {
      // Convert our tool definitions to AI SDK v7 tool format
      const aiTools: Record<string, any> = {};
      for (const [name, def] of Object.entries(toolDefs)) {
        aiTools[name] = {
          description: def.description,
          inputSchema: z.object(def.zodShape),
          execute: async (args: any) => {
            console.log("[DEBUG] tool execute called with args:", JSON.stringify(args));
            const result = await def.execute(args);
            onToolResult({ toolName: name, args, result });
            return result;
          },
        };
      }

      const result = streamText({
        model: this.provider(model),
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        tools: aiTools,
        stopWhen: isStepCount(3),
        abortSignal,
      });

      let totalTokens = 0;
      let finishReason = "stop";

      console.log("[DEBUG] streamChatWithTools: starting fullStream iteration");

      for await (const part of result.fullStream) {
        if (part.type === "text-delta") {
          onChunk(part.text);
        } else if (part.type === "tool-call") {
          console.log("[DEBUG] streamChatWithTools: tool-call FULL =", JSON.stringify(part, null, 2));
        } else if (part.type === "tool-input-delta") {
          console.log("[DEBUG] streamChatWithTools: tool-input-delta =", JSON.stringify((part as any).inputDelta || (part as any).delta || (part as any)));
        } else if (part.type === "tool-error") {
          console.log("[DEBUG] streamChatWithTools: tool-error =", (part as any).error?.message || (part as any).error || part);
        } else {
          console.log("[DEBUG] streamChatWithTools: part type =", part.type);
        }
      }

      console.log("[DEBUG] streamChatWithTools: fullStream iteration complete");

      // Get usage after stream completes
      const usage = await result.usage;
      totalTokens = (usage?.totalTokens) ?? 0;

      const reason = await result.finishReason;
      finishReason = reason ?? "stop";

      console.log("[DEBUG] streamChatWithTools: calling onFinish", { totalTokens, finishReason });
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
