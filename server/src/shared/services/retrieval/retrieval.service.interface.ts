export type RetrievedChunk = {
  id: string;
  sourceId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  similarity: number;
};

export type RetrievalOptions = {
  topK?: number;
  minScore?: number;
};

export interface IRetrievalService {
  retrieveRelevantChunks(notebookId: string, query: string, options?: RetrievalOptions): Promise<RetrievedChunk[]>;
}
