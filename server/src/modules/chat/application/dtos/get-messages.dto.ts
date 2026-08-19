import { SourceReference } from "../../../../infrastructure/repositories/messages/messages.types.ts";

export interface GetMessagesRequestDto {
  notebookId: string;
  userId: string;
  conversationId: string;
  limit?: number;
  before?: string;
}

export interface MessageResponseDto {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourcesUsed: SourceReference[] | null;
  createdAt: string;
}

export interface GetMessagesResponseDto {
  messages: MessageResponseDto[];
  hasMore: boolean;
}
