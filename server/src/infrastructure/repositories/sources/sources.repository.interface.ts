import { SourceEntity } from "../../../domain/entities/source.entity.ts";

export interface ISourcesRepository {
  create(entity: SourceEntity): Promise<void>;
  findById(id: string): Promise<SourceEntity | null>;
  findAllByNotebookId(notebookId: string, userId: string): Promise<SourceEntity[]>;
  update(entity: SourceEntity): Promise<void>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
}
