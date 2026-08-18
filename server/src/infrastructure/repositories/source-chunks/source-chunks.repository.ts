import { PoolClient } from "pg";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { ISourceChunksRepository } from "./source-chunks.repository.interface.ts";
import { SourceChunkRow } from "./source-chunks.types.ts";

export class SourceChunksRepository implements ISourceChunksRepository {
  private readonly TABLE = "source_chunks";

  constructor(private readonly db: IDatabaseService) {}

  async createMany(chunks: {
    id: string;
    sourceId: string;
    notebookId: string;
    content: string;
    chunkIndex: number;
    tokenCount: number;
    embedding: number[];
  }[], client?: PoolClient): Promise<void> {
    if (chunks.length === 0) return;

    // Build bulk insert with parameterized values
    const values: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const chunk of chunks) {
      values.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}::vector, NOW())`
      );
      params.push(
        chunk.id,
        chunk.sourceId,
        chunk.notebookId,
        chunk.content,
        chunk.chunkIndex,
        chunk.tokenCount,
        `[${chunk.embedding.join(",")}]`
      );
      paramIndex += 7;
    }

    const sql = `
      INSERT INTO ${this.TABLE} (
        id, source_id, notebook_id, content, chunk_index, token_count, embedding, created_at
      ) VALUES ${values.join(", ")}
    `;

    if (client) {
      await client.query(sql, params);
    } else {
      await this.db.insert(sql, params);
    }
  }

  async deleteBySourceId(sourceId: string, client?: PoolClient): Promise<void> {
    const sql = `DELETE FROM ${this.TABLE} WHERE source_id = $1`;
    if (client) {
      await client.query(sql, [sourceId]);
    } else {
      await this.db.delete(sql, [sourceId]);
    }
  }

  async deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void> {
    const sql = `DELETE FROM ${this.TABLE} WHERE notebook_id = $1`;
    if (client) {
      await client.query(sql, [notebookId]);
    } else {
      await this.db.delete(sql, [notebookId]);
    }
  }

  async searchByEmbedding(
    notebookId: string,
    embedding: number[],
    limit: number
  ): Promise<(SourceChunkRow & { similarity: number })[]> {
    const sql = `
      SELECT id, source_id, notebook_id, content, chunk_index, token_count, created_at,
             1 - (embedding <=> $2::vector) AS similarity
      FROM ${this.TABLE}
      WHERE notebook_id = $1
      ORDER BY embedding <=> $2::vector
      LIMIT $3
    `;
    const embeddingStr = `[${embedding.join(",")}]`;
    return this.db.selectMany<SourceChunkRow & { similarity: number }>(sql, [notebookId, embeddingStr, limit]);
  }
}
