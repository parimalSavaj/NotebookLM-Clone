export interface SendMessageRequestDto {
  notebookId: string;
  userId: string;
  conversationId: string | null;
  message: string;
}

export interface SendMessageSourceDto {
  sourceId: string;
  chunkId: string;
  similarity: number;
  content: string;
}
