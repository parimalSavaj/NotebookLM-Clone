import { SourceChunkRow } from "./source-chunks.types.ts";

export interface ISourceChunksRepository {
  createMany(chunks: {
    id: string;
    sourceId: string;
    notebookId: string;
    content: string;
    chunkIndex: number;
    tokenCount: number;
    embedding: number[];
  }[]): Promise<void>;
  deleteBySourceId(sourceId: string): Promise<void>;
  searchByEmbedding(notebookId: string, embedding: number[], limit: number): Promise<SourceChunkRow[]>;
}
