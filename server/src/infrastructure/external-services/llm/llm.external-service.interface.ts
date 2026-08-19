import { LlmMessage, LlmStreamCallbacks, LlmGenerateResult, LlmToolResult } from "./llm.types.ts";
import { z } from "zod/v4";

export type LlmToolDefinition = {
  description: string;
  /** Zod shape object (the argument to z.object()) */
  zodShape: Record<string, z.ZodType<any>>;
  execute: (args: any) => Promise<unknown>;
};

export interface ILlmService {
  streamChat(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
    onChunk: (text: string) => void;
    onFinish: (result: { totalTokens: number; finishReason: string }) => void;
    onError: (error: Error) => void;
    abortSignal?: AbortSignal;
  }): Promise<void>;

  streamChatWithTools(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
    tools: Record<string, LlmToolDefinition>;
    onChunk: (text: string) => void;
    onToolResult: (result: LlmToolResult) => void;
    onFinish: (result: { totalTokens: number; finishReason: string }) => void;
    onError: (error: Error) => void;
    abortSignal?: AbortSignal;
  }): Promise<void>;

  generateText(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
  }): Promise<LlmGenerateResult>;
}
