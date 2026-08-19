export interface ListConversationsRequestDto {
  notebookId: string;
  userId: string;
}

export interface ConversationResponseDto {
  id: string;
  title: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}
