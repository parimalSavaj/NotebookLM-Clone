import { aiConfig } from "../../config/ai.config.ts";
import { IRetrievalService, RetrievedChunk, RetrievalOptions } from "./retrieval.service.interface.ts";
import { IRetrievalEmbeddingProvider, IRetrievalChunkStore } from "./retrieval.types.ts";

export class RetrievalService implements IRetrievalService {
  constructor(
    private readonly embeddingProvider: IRetrievalEmbeddingProvider,
    private readonly chunkStore: IRetrievalChunkStore
  ) {}

  async retrieveRelevantChunks(
    notebookId: string,
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const topK = options?.topK ?? aiConfig.rag.topK;
    const minScore = options?.minScore ?? aiConfig.rag.minScore;

    // 1. Embed the user query
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);

    // 2. Search for similar chunks in the notebook
    const results = await this.chunkStore.searchByEmbedding(notebookId, queryEmbedding, topK);

    // 3. Filter by minimum similarity score
    const filtered = results.filter((chunk) => chunk.similarity >= minScore);

    // 4. Map to clean response
    return filtered.map((chunk) => ({
      id: chunk.id,
      sourceId: chunk.source_id,
      content: chunk.content,
      chunkIndex: chunk.chunk_index,
      tokenCount: chunk.token_count,
      similarity: chunk.similarity,
    }));
  }
}
