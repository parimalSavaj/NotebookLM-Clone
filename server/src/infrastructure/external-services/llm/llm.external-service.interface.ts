import { LlmMessage, LlmStreamCallbacks, LlmGenerateResult } from "./llm.types.ts";

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

  generateText(params: {
    model: string;
    systemPrompt: string;
    messages: LlmMessage[];
  }): Promise<LlmGenerateResult>;
}
