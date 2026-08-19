export const SUMMARIZE_CONVERSATION_JOB = "conversation/summarize" as const;

export type SummarizeConversationPayload = {
  conversationId: string;
};

export type SummarizeConversationResult = {
  conversationId: string;
  summaryLength: number;
};
