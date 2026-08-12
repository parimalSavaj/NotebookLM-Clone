export const aiConfig = {
  embedding: {
    model: "openai/text-embedding-3-small",
  },
  chunking: {
    chunkSize: 500,
    chunkOverlap: 50,
  },
} as const;
