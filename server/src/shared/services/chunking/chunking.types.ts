export type ChunkResult = {
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata?: Record<string, unknown>;
};
