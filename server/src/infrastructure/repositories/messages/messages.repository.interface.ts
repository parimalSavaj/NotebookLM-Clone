import { PoolClient } from "pg";
import { MessageRow, MessageRole, SourceReference } from "./messages.types.ts";

export interface IMessagesRepository {
  create(params: {
    id: string;
    conversationId: string;
    notebookId: string;
    role: MessageRole;
    content: string;
    sourcesUsed?: SourceReference[] | null;
    tokenCount?: number | null;
  }, client?: PoolClient): Promise<MessageRow>;

  findByConversationId(
    conversationId: string,
    options?: { limit?: number; before?: string }
  ): Promise<MessageRow[]>;

  getRecentMessages(conversationId: string, limit: number): Promise<MessageRow[]>;

  countByConversationId(conversationId: string): Promise<number>;

  deleteByConversationId(conversationId: string, client?: PoolClient): Promise<void>;

  deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void>;
}
