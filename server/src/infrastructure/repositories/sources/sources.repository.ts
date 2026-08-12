import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { SourceEntity } from "../../../domain/entities/source.entity.ts";
import { ISourcesRepository } from "./sources.repository.interface.ts";
import { SourceRow } from "./sources.types.ts";

export class SourcesRepository implements ISourcesRepository {
  private readonly TABLE = "sources";

  constructor(private readonly db: IDatabaseService) {}

  async create(entity: SourceEntity): Promise<void> {
    const sql = `
      INSERT INTO ${this.TABLE} (
        id, notebook_id, user_id, title, type, status,
        metadata, file_size, chunk_count, char_count,
        error_message, processed_at, created_at, updated_at, deleted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;
    const params = [
      entity.id,
      entity.notebookId,
      entity.userId,
      entity.title,
      entity.type,
      entity.status,
      JSON.stringify(entity.metadata),
      entity.fileSize,
      entity.chunkCount,
      entity.charCount,
      entity.errorMessage,
      entity.processedAt,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    ];

    await this.db.insert(sql, params);
  }

  async findById(id: string): Promise<SourceEntity | null> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const row = await this.db.selectOne<SourceRow>(sql, [id]);
    return row ? SourceEntity.fromRecord(row) : null;
  }

  async findAllByNotebookId(notebookId: string, userId: string): Promise<SourceEntity[]> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE notebook_id = $1 AND user_id = $2 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const rows = await this.db.selectMany<SourceRow>(sql, [notebookId, userId]);
    return rows.map((row) => SourceEntity.fromRecord(row));
  }

  async update(entity: SourceEntity): Promise<void> {
    const sql = `
      UPDATE ${this.TABLE}
      SET status = $1, chunk_count = $2, char_count = $3,
          error_message = $4, processed_at = $5, updated_at = $6
      WHERE id = $7 AND deleted_at IS NULL
    `;
    const params = [
      entity.status,
      entity.chunkCount,
      entity.charCount,
      entity.errorMessage,
      entity.processedAt,
      entity.updatedAt,
      entity.id,
    ];

    await this.db.update(sql, params);
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    const sql = `
      UPDATE ${this.TABLE}
      SET deleted_at = $1, updated_at = $1
      WHERE id = $2 AND deleted_at IS NULL
    `;
    await this.db.update(sql, [deletedAt, id]);
  }
}
