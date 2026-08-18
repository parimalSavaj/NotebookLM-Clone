import { PoolClient } from "pg";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { NotebookEntity } from "../../../domain/entities/notebook.entity.ts";
import { INotebooksRepository } from "./notebooks.repository.interface.ts";
import { NotebookRow } from "./notebooks.types.ts";

export class NotebooksRepository implements INotebooksRepository {
  private readonly TABLE = "notebooks";

  constructor(private readonly db: IDatabaseService) {}

  async create(entity: NotebookEntity): Promise<void> {
    const sql = `
      INSERT INTO ${this.TABLE} (
        id, user_id, title, description, emoji,
        ai_provider, ai_model, active_source_count,
        last_opened_at, created_at, updated_at, deleted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    const params = [
      entity.id,
      entity.userId,
      entity.title,
      entity.description,
      entity.emoji,
      entity.aiProvider,
      entity.aiModel,
      entity.activeSourceCount,
      entity.lastOpenedAt,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    ];

    await this.db.insert(sql, params);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<NotebookEntity | null> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    const row = await this.db.selectOne<NotebookRow>(sql, [id, userId]);

    return row ? this.toEntity(row) : null;
  }

  async findByTitleAndUserId(title: string, userId: string): Promise<NotebookEntity | null> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE title = $1 AND user_id = $2 AND deleted_at IS NULL
    `;
    const row = await this.db.selectOne<NotebookRow>(sql, [title, userId]);

    return row ? this.toEntity(row) : null;
  }

  async findAllByUserId(userId: string): Promise<NotebookEntity[]> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY last_opened_at DESC NULLS LAST, created_at DESC
    `;
    const rows = await this.db.selectMany<NotebookRow>(sql, [userId]);

    return rows.map((row) => this.toEntity(row));
  }

  async update(entity: NotebookEntity): Promise<void> {
    const sql = `
      UPDATE ${this.TABLE}
      SET title = $1, description = $2, emoji = $3,
          ai_provider = $4, ai_model = $5, active_source_count = $6,
          last_opened_at = $7, updated_at = $8
      WHERE id = $9 AND deleted_at IS NULL
    `;
    const params = [
      entity.title,
      entity.description,
      entity.emoji,
      entity.aiProvider,
      entity.aiModel,
      entity.activeSourceCount,
      entity.lastOpenedAt,
      entity.updatedAt,
      entity.id,
    ];

    await this.db.update(sql, params);
  }

  async softDelete(id: string, deletedAt: Date, client?: PoolClient): Promise<void> {
    const sql = `
      UPDATE ${this.TABLE}
      SET deleted_at = $1, updated_at = $1
      WHERE id = $2 AND deleted_at IS NULL
    `;
    const params = [deletedAt, id];

    if (client) {
      await client.query(sql, params);
    } else {
      await this.db.update(sql, params);
    }
  }

  async incrementActiveSourceCount(id: string, client?: PoolClient): Promise<void> {
    const sql = `
      UPDATE ${this.TABLE}
      SET active_source_count = active_source_count + 1, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id];

    if (client) {
      await client.query(sql, params);
    } else {
      await this.db.update(sql, params);
    }
  }

  async decrementActiveSourceCount(id: string, client?: PoolClient): Promise<void> {
    const sql = `
      UPDATE ${this.TABLE}
      SET active_source_count = GREATEST(active_source_count - 1, 0), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const params = [id];

    if (client) {
      await client.query(sql, params);
    } else {
      await this.db.update(sql, params);
    }
  }

  private toEntity(row: NotebookRow): NotebookEntity {
    return NotebookEntity.fromRecord(row);
  }
}
