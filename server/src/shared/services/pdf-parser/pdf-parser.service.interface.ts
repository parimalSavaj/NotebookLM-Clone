export interface PdfParseResult {
  text: string;
  totalPages: number;
}

export interface IPdfParserService {
  extractText(pdfBuffer: Buffer): Promise<PdfParseResult>;
}
