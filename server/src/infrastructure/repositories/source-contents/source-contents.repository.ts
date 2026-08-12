import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { ISourceContentsRepository } from "./source-contents.repository.interface.ts";
import { SourceContentRow } from "./source-contents.types.ts";

export class SourceContentsRepository implements ISourceContentsRepository {
  private readonly TABLE = "source_contents";

  constructor(private readonly db: IDatabaseService) {}

  async create(id: string, sourceId: string, content: string): Promise<void> {
    const sql = `
      INSERT INTO ${this.TABLE} (id, source_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
    `;
    await this.db.insert(sql, [id, sourceId, content]);
  }

  async findBySourceId(sourceId: string): Promise<SourceContentRow | null> {
    const sql = `
      SELECT * FROM ${this.TABLE}
      WHERE source_id = $1
    `;
    return this.db.selectOne<SourceContentRow>(sql, [sourceId]);
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    const sql = `DELETE FROM ${this.TABLE} WHERE source_id = $1`;
    await this.db.delete(sql, [sourceId]);
  }
}
