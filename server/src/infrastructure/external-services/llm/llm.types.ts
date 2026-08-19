export type LlmRole = "user" | "assistant" | "system";

export type LlmMessage = {
  role: LlmRole;
  content: string;
};

export type LlmStreamCallbacks = {
  onChunk: (text: string) => void;
  onFinish: (result: { totalTokens: number; finishReason: string }) => void;
  onError: (error: Error) => void;
};

export type LlmGenerateResult = {
  text: string;
  totalTokens: number;
  finishReason: string;
};

export type LlmToolResult = {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
};
