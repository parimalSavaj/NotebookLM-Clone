import { PoolClient } from "pg";
import { ConversationRow } from "./conversations.types.ts";

export interface IConversationsRepository {
  create(id: string, notebookId: string, userId: string, title?: string | null): Promise<ConversationRow>;
  findById(id: string): Promise<ConversationRow | null>;
  findByIdAndUserId(id: string, userId: string): Promise<ConversationRow | null>;
  findAllByNotebookId(notebookId: string, userId: string): Promise<ConversationRow[]>;
  updateTitle(id: string, title: string): Promise<void>;
  updateSummary(id: string, summary: string): Promise<void>;
  incrementMessageCount(id: string, count?: number, client?: PoolClient): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void>;
}
