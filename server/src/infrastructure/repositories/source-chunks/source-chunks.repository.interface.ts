import { PoolClient } from "pg";
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
  }[], client?: PoolClient): Promise<void>;
  deleteBySourceId(sourceId: string, client?: PoolClient): Promise<void>;
  deleteByNotebookId(notebookId: string, client?: PoolClient): Promise<void>;
  searchByEmbedding(notebookId: string, embedding: number[], limit: number): Promise<(SourceChunkRow & { similarity: number })[]>;
}
