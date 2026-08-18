import { PoolClient } from "pg";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { ISourceContentsRepository } from "./source-contents.repository.interface.ts";
import { SourceContentRow } from "./source-contents.types.ts";

export class SourceContentsRepository implements ISourceContentsRepository {
  private readonly TABLE = "source_contents";

  constructor(private readonly db: IDatabaseService) {}

  async create(id: string, sourceId: string, content: string, client?: PoolClient): Promise<void> {
    const sql = `
      INSERT INTO ${this.TABLE} (id, source_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
    `;
    const params = [id, sourceId, content];

    if (client) {
      await client.query(sql, params);
    } else {
      await this.db.insert(sql, params);
    }
  }

  async findBySourceId(sourceId: string): Promise<SourceContentRow | null> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE source_id = $1
    `;
    return this.db.selectOne<SourceContentRow>(sql, [sourceId]);
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
    const sql = `
      DELETE FROM ${this.TABLE}
      WHERE source_id IN (
        SELECT id FROM sources WHERE notebook_id = $1
      )
    `;
    if (client) {
      await client.query(sql, [notebookId]);
    } else {
      await this.db.delete(sql, [notebookId]);
    }
  }
}
