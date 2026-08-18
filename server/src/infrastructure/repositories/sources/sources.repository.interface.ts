import { PoolClient } from "pg";
import { SourceEntity } from "../../../domain/entities/source.entity.ts";

export interface ISourcesRepository {
  create(entity: SourceEntity): Promise<void>;
  findById(id: string): Promise<SourceEntity | null>;
  findAllByNotebookId(notebookId: string, userId: string): Promise<SourceEntity[]>;
  update(entity: SourceEntity, client?: PoolClient): Promise<void>;
  softDelete(id: string, deletedAt: Date, client?: PoolClient): Promise<void>;
  softDeleteByNotebookId(notebookId: string, deletedAt: Date, client?: PoolClient): Promise<void>;
}
