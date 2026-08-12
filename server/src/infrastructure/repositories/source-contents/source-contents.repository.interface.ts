import { SourceContentRow } from "./source-contents.types.ts";

export interface ISourceContentsRepository {
  create(id: string, sourceId: string, content: string): Promise<void>;
  findBySourceId(sourceId: string): Promise<SourceContentRow | null>;
  deleteBySourceId(sourceId: string): Promise<void>;
}
