import { NotebookEntity } from "../../../domain/entities/notebook.entity.ts";

export interface INotebooksRepository {
  create(entity: NotebookEntity): Promise<void>;
  findByIdAndUserId(id: string, userId: string): Promise<NotebookEntity | null>;
  findByTitleAndUserId(title: string, userId: string): Promise<NotebookEntity | null>;
  findAllByUserId(userId: string): Promise<NotebookEntity[]>;
  update(entity: NotebookEntity): Promise<void>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
}
