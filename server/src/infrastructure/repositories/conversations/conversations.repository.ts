import { PoolClient } from "pg";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { IConversationsRepository } from "./conversations.repository.interface.ts";
import { ConversationRow } from "./conversations.types.ts";

export class ConversationsRepository implements IConversationsRepository {
  constructor(private readonly db: IDatabaseService) {}

  async create(id: string, notebookId: string, userId: string, title?: string | null): Promise<ConversationRow> {
    const row = await this.db.selectOne<ConversationRow>(
      `INSERT INTO conversations (id, notebook_id, user_id, title)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, notebookId, userId, title ?? null]
    );
    return row!;
  }

  async findById(id: string): Promise<ConversationRow | null> {
    return this.db.selectOne<ConversationRow>(
      `SELECT * FROM conversations WHERE id = $1`,
      [id]
    );
  }

  async findByIdAndUserId(id: string, userId: string): Promise<ConversationRow | null> {
    return this.db.selectOne<ConversationRow>(
      `SELECT * FROM conversations WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  async findAllByNotebookId(notebookId: string, userId: string): Promise<ConversationRow[]> {
    return this.db.selectMany<ConversationRow>(
      `SELECT * FROM conversations
       WHERE notebook_id = $1 AND user_id = $2
       ORDER BY updated_at DESC`,
      [notebookId, userId]
    );
  }

  async updateTitle(id: string, title: string): Promise<void> {
    await this.db.update(
      `UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2`,
      [title, id]
    );
  }

  async updateSummary(id: string, summary: string): Promise<void> {
    await this.db.update(
      `UPDATE conversations SET summary = $1, updated_at = NOW() WHERE id = $2`,
      [summary, id]
    );
  }

  async incrementMessageCount(id: string, count: number = 1, client?: PoolClient): Promise<void> {
    const sql = `UPDATE conversations SET message_count = message_count + $1, updated_at = NOW() WHERE id = $2`;
    if (client) {
      await client.query(sql, [count, id]);
    } else {
      await this.db.update(sql, [count, id]);
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(`DELETE FROM conversations WHERE id = $1`, [id]);
  }

  async deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void> {
    const sql = `DELETE FROM conversations WHERE notebook_id = $1`;
    if (client) {
      await client.query(sql, [notebookId]);
    } else {
      await this.db.delete(sql, [notebookId]);
    }
  }
}
