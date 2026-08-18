export type EmbeddingSearchResult = {
  id: string;
  source_id: string;
  content: string;
  chunk_index: number;
  token_count: number;
  similarity: number;
};

/**
 * Embedding generation contract for the retrieval service.
 * Consumers must inject an implementation (e.g., the embedding external service).
 */
export type IRetrievalEmbeddingProvider = {
  generateEmbedding(text: string): Promise<number[]>;
};

/**
 * Chunk search contract for the retrieval service.
 * Consumers must inject an implementation (e.g., the source-chunks repository).
 */
export type IRetrievalChunkStore = {
  searchByEmbedding(notebookId: string, embedding: number[], limit: number): Promise<EmbeddingSearchResult[]>;
};
