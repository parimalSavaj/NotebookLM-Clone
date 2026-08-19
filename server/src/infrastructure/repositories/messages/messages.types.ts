export type MessageRole = "user" | "assistant";

export type SourceReference = {
  sourceId: string;
  chunkId: string;
  similarity: number;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  notebook_id: string;
  role: MessageRole;
  content: string;
  sources_used: SourceReference[] | null;
  token_count: number | null;
  created_at: Date;
};
