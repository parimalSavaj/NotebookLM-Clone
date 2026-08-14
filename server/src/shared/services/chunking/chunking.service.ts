import { IChunkingService } from "./chunking.service.interface.ts";
import { ChunkResult } from "./chunking.types.ts";

/**
 * Separators tried in order, from "most natural" to "most aggressive".
 * The splitter walks this list and uses the first separator that actually
 * breaks the text into multiple parts.
 */
const SEPARATORS = ["\n\n", "\n", ". ", " ", ""];

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

  chunk(content: string): ChunkResult[] {
    const parts = this.splitText(content.trim());

    return parts.map((text, index) => ({
      content: text,
      chunkIndex: index,
      tokenCount: this.estimateTokenCount(text),
    }));
  }

  chunkPages(pages: string[]): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    let index = 0;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageText = pages[pageIndex].trim();
      if (!pageText) continue;

      const pageChunks = this.splitText(pageText);

      for (const content of pageChunks) {
        chunks.push({
          content,
          chunkIndex: index,
          tokenCount: this.estimateTokenCount(content),
          metadata: { page: pageIndex + 1 },
        });
        index++;
      }
    }

    return chunks;
  }

  /**
   * Splits text using a recursive separator strategy.
   * Tries paragraph → line → sentence → word → character boundaries.
   */
  private splitText(text: string): string[] {
    const chunks: string[] = [];

    for (const separator of SEPARATORS) {
      if (separator) {
        const splits = text.split(separator).filter(Boolean);
        if (splits.length === 1) continue;
        chunks.push(...this.mergeSplits(splits, separator));
      } else {
        // Last resort: slice by character count with overlap
        for (let i = 0; i < text.length; i += this.chunkSize - this.chunkOverlap) {
          chunks.push(text.slice(i, i + this.chunkSize));
        }
      }

      if (chunks.length > 0) break;
    }

    return chunks.filter((chunk) => chunk.trim().length > 0);
  }

  /**
   * Combines small text splits into larger chunks without exceeding chunkSize.
   * Keeps adding splits until the next one would overflow, then seals and starts a new chunk.
   */
  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    let current: string[] = [];
    let total = 0;

    for (const split of splits) {
      const len = split.length;
      const sepLen = current.length > 0 ? separator.length : 0;

      if (total + len + sepLen > this.chunkSize && current.length > 0) {
        docs.push(current.join(separator));
        total = 0;
        current = [];
      }

      current.push(split);
      total += len + sepLen;
    }

    if (current.length > 0) {
      docs.push(current.join(separator));
    }

    return docs;
  }

  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
