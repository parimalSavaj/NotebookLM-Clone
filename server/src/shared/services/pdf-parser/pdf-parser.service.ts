import { extractText } from "unpdf";
import { IPdfParserService, PdfParseResult } from "./pdf-parser.service.interface.ts";

export class PdfParserService implements IPdfParserService {
  private static instance: PdfParserService | null = null;

  private constructor() {}

  static getInstance(): PdfParserService {
    if (!PdfParserService.instance) {
      PdfParserService.instance = new PdfParserService();
    }
    return PdfParserService.instance;
  }

  async extractText(pdfBuffer: Buffer): Promise<PdfParseResult> {
    const { text, totalPages } = await extractText(new Uint8Array(pdfBuffer));

    const fullText = Array.isArray(text) ? text.join("\n") : text;

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("PDF contains no extractable text (may be scanned/image-based)");
    }

    return {
      text: fullText.trim(),
      totalPages,
    };
  }
}
