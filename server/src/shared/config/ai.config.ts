export const aiConfig = {
  embedding: {
    /** OpenAI embedding model used for RAG vector indexing and query embedding. */
    model: "openai/text-embedding-3-small",
    /** Vector dimension count — must match pgvector index configuration. */
    dimensions: 1536,
  },
  chunking: {
    /** Target max characters per text chunk during source processing. */
    chunkSize: 1000,
    /** Character overlap between consecutive chunks at split boundaries. */
    chunkOverlap: 100,
  },
  chat: {
    /** Default chat model (OpenRouter provider-prefixed id) when none is specified. */
    defaultModel: "openai/gpt-4o-mini",
    /** Allowed chat models (OpenRouter provider-prefixed ids) exposed to the client and workspace settings. */
    models: ["openai/gpt-4o-mini", "openai/gpt-4o"] as const,
  },
  rag: {
    /** Number of chunks to retrieve per chat query. */
    topK: 6,
    /** Minimum cosine similarity score for a retrieved chunk to be included in context. */
    minScore: 0.15,
  },
  conversation: {
    /** Enqueue a conversation summary job every N persisted messages. */
    summaryInterval: 8,
    /** Max recent UI messages sent to the model when a rolling summary exists. */
    recentMessageWindow: 12,
  },
} as const;
