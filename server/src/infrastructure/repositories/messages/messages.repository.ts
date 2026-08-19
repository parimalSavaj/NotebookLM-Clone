import { PoolClient } from "pg";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { IMessagesRepository } from "./messages.repository.interface.ts";
import { MessageRow, MessageRole, SourceReference } from "./messages.types.ts";

export class MessagesRepository implements IMessagesRepository {
  constructor(private readonly db: IDatabaseService) {}

  async create(params: {
    id: string;
    conversationId: string;
    notebookId: string;
    role: MessageRole;
    content: string;
    sourcesUsed?: SourceReference[] | null;
    tokenCount?: number | null;
  }, client?: PoolClient): Promise<MessageRow> {
    const sql = `
      INSERT INTO messages (id, conversation_id, notebook_id, role, content, sources_used, token_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      params.id,
      params.conversationId,
      params.notebookId,
      params.role,
      params.content,
      params.sourcesUsed ? JSON.stringify(params.sourcesUsed) : null,
      params.tokenCount ?? null,
    ];

    if (client) {
      const result = await client.query(sql, values);
      return result.rows[0];
    }

    const row = await this.db.selectOne<MessageRow>(sql, values);
    return row!;
  }

  async findByConversationId(
    conversationId: string,
    options?: { limit?: number; before?: string }
  ): Promise<MessageRow[]> {
    const limit = options?.limit ?? 50;

    if (options?.before) {
      return this.db.selectMany<MessageRow>(
        `SELECT * FROM messages
         WHERE conversation_id = $1 AND created_at < (SELECT created_at FROM messages WHERE id = $2)
         ORDER BY created_at DESC
         LIMIT $3`,
        [conversationId, options.before, limit]
      );
    }

    return this.db.selectMany<MessageRow>(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversationId, limit]
    );
  }

  async getRecentMessages(conversationId: string, limit: number): Promise<MessageRow[]> {
    const rows = await this.db.selectMany<MessageRow>(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [conversationId, limit]
    );
    // Reverse to get chronological order
    return rows.reverse();
  }

  async countByConversationId(conversationId: string): Promise<number> {
    const result = await this.db.selectOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
    return parseInt(result?.count ?? "0", 10);
  }

  async deleteByConversationId(conversationId: string, client?: PoolClient): Promise<void> {
    const sql = `DELETE FROM messages WHERE conversation_id = $1`;
    if (client) {
      await client.query(sql, [conversationId]);
    } else {
      await this.db.delete(sql, [conversationId]);
    }
  }

  async deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void> {
    const sql = `DELETE FROM messages WHERE notebook_id = $1`;
    if (client) {
      await client.query(sql, [notebookId]);
    } else {
      await this.db.delete(sql, [notebookId]);
    }
  }
}
