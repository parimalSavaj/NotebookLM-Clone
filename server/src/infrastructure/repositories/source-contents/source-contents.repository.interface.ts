import { PoolClient } from "pg";
import { SourceContentRow } from "./source-contents.types.ts";

export interface ISourceContentsRepository {
  create(id: string, sourceId: string, content: string, client?: PoolClient): Promise<void>;
  findBySourceId(sourceId: string): Promise<SourceContentRow | null>;
  deleteBySourceId(sourceId: string, client?: PoolClient): Promise<void>;
  deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void>;
}
