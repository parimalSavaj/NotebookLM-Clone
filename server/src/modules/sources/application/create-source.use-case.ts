import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { ISourceContentsRepository } from "../../../infrastructure/repositories/source-contents/source-contents.repository.interface.ts";
import { ISourceChunksRepository } from "../../../infrastructure/repositories/source-chunks/source-chunks.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { IChunkingService } from "../../../shared/services/chunking/chunking.service.interface.ts";
import { IPdfParserService } from "../../../shared/services/pdf-parser/pdf-parser.service.interface.ts";
import { IEmbeddingService } from "../../../infrastructure/external-services/embedding/embedding.external-service.interface.ts";
import { IFirecrawlService } from "../../../infrastructure/external-services/firecrawl/firecrawl.external-service.interface.ts";
import { ICloudinaryService } from "../../../infrastructure/external-services/cloudinary/cloudinary.external-service.interface.ts";
import { NotFoundError, InternalError } from "../../../shared/core/api-error.ts";
import { SourceEntity } from "../../../domain/entities/source.entity.ts";
import { SourceType } from "../../../domain/enums/source-type.enum.ts";
import { CreateSourceRequestDto, CreateSourceResponseDto } from "./dtos/create-source.dto.ts";

export class CreateSourceUseCase {
  constructor(
    private readonly sourcesRepository: ISourcesRepository,
    private readonly sourceContentsRepository: ISourceContentsRepository,
    private readonly sourceChunksRepository: ISourceChunksRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly idService: IIdService,
    private readonly logger: ILoggerService,
    private readonly chunkingService: IChunkingService,
    private readonly embeddingService: IEmbeddingService,
    private readonly firecrawlService: IFirecrawlService,
    private readonly cloudinaryService: ICloudinaryService,
    private readonly pdfParserService: IPdfParserService
  ) {}

  async execute(dto: CreateSourceRequestDto): Promise<CreateSourceResponseDto> {
    this.logger.info("Creating source", {
      notebookId: dto.notebookId,
      userId: dto.userId,
      type: dto.type,
    });

    // Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.notebookId, dto.userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const sourceId = this.idService.generate();

    const source = SourceEntity.create({
      id: sourceId,
      notebookId: dto.notebookId,
      userId: dto.userId,
      title: dto.title,
      type: dto.type,
      metadata: dto.metadata,
      fileSize: dto.fileBuffer ? dto.fileBuffer.length : (dto.content ? Buffer.byteLength(dto.content, "utf-8") : null),
    });

    try {
      await this.sourcesRepository.create(source);
    } catch (error) {
      this.logger.error("Failed to create source", { error: (error as Error).message });
      throw new InternalError("Failed to create source - please try again");
    }

    // For text/markdown: process synchronously (MVP)
    if (
      (dto.type === SourceType.TEXT || dto.type === SourceType.MARKDOWN) &&
      dto.content
    ) {
      await this.processTextSource(source, dto.content);
    }

    // For URL: scrape with Firecrawl then process the markdown content
    if (dto.type === SourceType.URL && dto.metadata?.url) {
      await this.processUrlSource(source, dto.metadata.url as string);
    }

    // For PDF: upload to Cloudinary, extract text, chunk, embed
    if (dto.type === SourceType.PDF && dto.fileBuffer) {
      await this.processPdfSource(source, dto.fileBuffer, dto.originalFilename ?? "document.pdf");
    }

    // Re-fetch the source to get updated status
    const updatedSource = await this.sourcesRepository.findById(sourceId);
    return CreateSourceResponseDto.toResponse(updatedSource ?? source);
  }

  private async processTextSource(source: SourceEntity, content: string): Promise<void> {
    try {
      source.markProcessing();
      await this.sourcesRepository.update(source);

      // Store full content
      const contentId = this.idService.generate();
      await this.sourceContentsRepository.create(contentId, source.id, content);

      // Chunk the content
      const chunks = this.chunkingService.chunk(content, source.type);

      if (chunks.length === 0) {
        source.markCompleted({ chunkCount: 0, charCount: content.length });
        await this.sourcesRepository.update(source);
        return;
      }

      // Generate embeddings for all chunks
      const chunkTexts = chunks.map((c) => c.content);
      const embeddings = await this.embeddingService.generateEmbeddings(chunkTexts);

      // Store chunks with embeddings
      const chunkRecords = chunks.map((chunk, index) => ({
        id: this.idService.generate(),
        sourceId: source.id,
        notebookId: source.notebookId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        embedding: embeddings[index],
      }));

      await this.sourceChunksRepository.createMany(chunkRecords);

      // Mark completed and update notebook active_source_count
      source.markCompleted({ chunkCount: chunks.length, charCount: content.length });
      await this.sourcesRepository.update(source);

      // Increment notebook active_source_count
      await this.notebooksRepository.incrementActiveSourceCount(source.notebookId);

      this.logger.info("Source processed successfully", {
        sourceId: source.id,
        chunkCount: chunks.length,
        charCount: content.length,
      });
    } catch (error) {
      this.logger.error("Failed to process source", {
        sourceId: source.id,
        error: (error as Error).message,
      });

      source.markFailed((error as Error).message);
      await this.sourcesRepository.update(source);
    }
  }

  private async processUrlSource(source: SourceEntity, url: string): Promise<void> {
    try {
      source.markProcessing();
      await this.sourcesRepository.update(source);

      this.logger.info("Scraping URL with Firecrawl", { sourceId: source.id, url });

      // Scrape the URL using Firecrawl
      const scrapeResult = await this.firecrawlService.scrapeUrl(url);
      const content = scrapeResult.markdown;

      if (!content || content.trim().length === 0) {
        throw new Error("Firecrawl returned empty content for the URL");
      }

      // Store full content
      const contentId = this.idService.generate();
      await this.sourceContentsRepository.create(contentId, source.id, content);

      // Chunk the content (treat scraped markdown as markdown type)
      const chunks = this.chunkingService.chunk(content, SourceType.MARKDOWN);

      if (chunks.length === 0) {
        source.markCompleted({ chunkCount: 0, charCount: content.length });
        await this.sourcesRepository.update(source);
        return;
      }

      // Generate embeddings for all chunks
      const chunkTexts = chunks.map((c) => c.content);
      const embeddings = await this.embeddingService.generateEmbeddings(chunkTexts);

      // Store chunks with embeddings
      const chunkRecords = chunks.map((chunk, index) => ({
        id: this.idService.generate(),
        sourceId: source.id,
        notebookId: source.notebookId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        embedding: embeddings[index],
      }));

      await this.sourceChunksRepository.createMany(chunkRecords);

      // Mark completed and update notebook active_source_count
      source.markCompleted({ chunkCount: chunks.length, charCount: content.length });
      await this.sourcesRepository.update(source);

      await this.notebooksRepository.incrementActiveSourceCount(source.notebookId);

      this.logger.info("URL source processed successfully", {
        sourceId: source.id,
        url,
        chunkCount: chunks.length,
        charCount: content.length,
      });
    } catch (error) {
      this.logger.error("Failed to process URL source", {
        sourceId: source.id,
        url,
        error: (error as Error).message,
      });

      source.markFailed((error as Error).message);
      await this.sourcesRepository.update(source);
    }
  }

  private async processPdfSource(source: SourceEntity, fileBuffer: Buffer, filename: string): Promise<void> {
    try {
      source.markProcessing();
      await this.sourcesRepository.update(source);

      this.logger.info("Processing PDF source", { sourceId: source.id, filename });

      // 1. Upload PDF to Cloudinary for storage
      const uploadResult = await this.cloudinaryService.uploadPdf(fileBuffer, filename, source.notebookId);

      // Store Cloudinary metadata on the source
      source.updateMetadata({
        cloudinaryPublicId: uploadResult.publicId,
        cloudinaryUrl: uploadResult.secureUrl,
        originalFilename: uploadResult.originalFilename,
        fileFormat: uploadResult.format,
        fileBytes: uploadResult.bytes,
      });
      await this.sourcesRepository.update(source);

      this.logger.info("PDF uploaded to Cloudinary", {
        sourceId: source.id,
        publicId: uploadResult.publicId,
        bytes: uploadResult.bytes,
      });

      // 2. Extract text from PDF using unpdf
      const parseResult = await this.pdfParserService.extractText(fileBuffer);
      const content = parseResult.text;

      this.logger.info("PDF text extracted", {
        sourceId: source.id,
        totalPages: parseResult.totalPages,
        charCount: content.length,
      });

      // 3. Store full extracted content
      const contentId = this.idService.generate();
      await this.sourceContentsRepository.create(contentId, source.id, content);

      // 4. Chunk the content
      const chunks = this.chunkingService.chunk(content, SourceType.PDF);

      if (chunks.length === 0) {
        source.markCompleted({ chunkCount: 0, charCount: content.length });
        await this.sourcesRepository.update(source);
        return;
      }

      // 5. Generate embeddings for all chunks
      const chunkTexts = chunks.map((c) => c.content);
      const embeddings = await this.embeddingService.generateEmbeddings(chunkTexts);

      // 6. Store chunks with embeddings
      const chunkRecords = chunks.map((chunk, index) => ({
        id: this.idService.generate(),
        sourceId: source.id,
        notebookId: source.notebookId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        embedding: embeddings[index],
      }));

      await this.sourceChunksRepository.createMany(chunkRecords);

      // 7. Mark completed and update notebook active_source_count
      source.markCompleted({ chunkCount: chunks.length, charCount: content.length });
      await this.sourcesRepository.update(source);

      await this.notebooksRepository.incrementActiveSourceCount(source.notebookId);

      this.logger.info("PDF source processed successfully", {
        sourceId: source.id,
        filename,
        totalPages: parseResult.totalPages,
        chunkCount: chunks.length,
        charCount: content.length,
        cloudinaryPublicId: uploadResult.publicId,
      });
    } catch (error) {
      this.logger.error("Failed to process PDF source", {
        sourceId: source.id,
        filename,
        error: (error as Error).message,
      });

      source.markFailed((error as Error).message);
      await this.sourcesRepository.update(source);
    }
  }
}
