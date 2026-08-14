import { ChunkResult } from "./chunking.types.ts";

export interface IChunkingService {
  chunk(content: string): ChunkResult[];
  chunkPages(pages: string[]): ChunkResult[];
}
