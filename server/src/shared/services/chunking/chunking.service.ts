import { SourceType } from "../../../domain/enums/source-type.enum.ts";
import { IChunkingService } from "./chunking.service.interface.ts";
import { ChunkResult } from "./chunking.types.ts";

export class ChunkingService implements IChunkingService {
  private static instance: ChunkingService | null = null;

  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  private constructor(chunkSize: number, chunkOverlap: number) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  static getInstance(chunkSize: number, chunkOverlap: number): ChunkingService {
    if (!ChunkingService.instance) {
      ChunkingService.instance = new ChunkingService(chunkSize, chunkOverlap);
    }
    return ChunkingService.instance;
  }

  chunk(content: string, _sourceType: SourceType): ChunkResult[] {
    // MVP: All source types use the same fixed-size chunking.
    // Strategy pattern in place — add type-specific methods later.
    return this.chunkByFixedSize(content);
  }

  private chunkByFixedSize(content: string): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return [];
    }

    // If content fits in one chunk, return as single chunk
    if (trimmedContent.length <= this.chunkSize) {
      return [
        {
          content: trimmedContent,
          chunkIndex: 0,
          tokenCount: this.estimateTokenCount(trimmedContent),
        },
      ];
    }

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < trimmedContent.length) {
      let endIndex = startIndex + this.chunkSize;

      // Don't exceed content length
      if (endIndex >= trimmedContent.length) {
        endIndex = trimmedContent.length;
      } else {
        // Try to break at a sentence or word boundary
        const breakPoint = this.findBreakPoint(trimmedContent, startIndex, endIndex);
        if (breakPoint > startIndex) {
          endIndex = breakPoint;
        }
      }

      const chunkContent = trimmedContent.slice(startIndex, endIndex).trim();

      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          chunkIndex,
          tokenCount: this.estimateTokenCount(chunkContent),
        });
        chunkIndex++;
      }

      // Move start forward, accounting for overlap
      startIndex = endIndex - this.chunkOverlap;

      // Prevent infinite loop if overlap exceeds chunk
      if (startIndex <= chunks[chunks.length - 1]?.chunkIndex && endIndex >= trimmedContent.length) {
        break;
      }

      // If we've reached the end, stop
      if (endIndex >= trimmedContent.length) {
        break;
      }
    }

    return chunks;
  }

  private findBreakPoint(content: string, start: number, end: number): number {
    // Look backwards from end for sentence boundaries
    const searchRegion = content.slice(start, end);

    // Try sentence boundary (. ! ?)
    const lastSentenceEnd = Math.max(
      searchRegion.lastIndexOf(". "),
      searchRegion.lastIndexOf("! "),
      searchRegion.lastIndexOf("? "),
      searchRegion.lastIndexOf(".\n"),
      searchRegion.lastIndexOf("!\n"),
      searchRegion.lastIndexOf("?\n")
    );

    if (lastSentenceEnd > searchRegion.length * 0.3) {
      return start + lastSentenceEnd + 1;
    }

    // Try paragraph boundary
    const lastNewline = searchRegion.lastIndexOf("\n\n");
    if (lastNewline > searchRegion.length * 0.3) {
      return start + lastNewline + 1;
    }

    // Try word boundary
    const lastSpace = searchRegion.lastIndexOf(" ");
    if (lastSpace > searchRegion.length * 0.3) {
      return start + lastSpace + 1;
    }

    return end;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimate: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
}
