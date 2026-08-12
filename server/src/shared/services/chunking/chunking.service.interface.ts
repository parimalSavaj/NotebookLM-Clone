import { SourceType } from "../../../domain/enums/source-type.enum.ts";
import { ChunkResult } from "./chunking.types.ts";

export interface IChunkingService {
  chunk(content: string, sourceType: SourceType): ChunkResult[];
}
