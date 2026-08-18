import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { IQueueService } from "../../../shared/services/queue/queue.service.interface.ts";
import { NotFoundError, InternalError } from "../../../shared/core/api-error.ts";
import { SourceEntity } from "../../../domain/entities/source.entity.ts";
import { PROCESS_SOURCE_JOB, ProcessSourcePayload } from "../../../jobs/workers/process-source/process-source.types.ts";
import { CreateSourceRequestDto, CreateSourceResponseDto } from "./dtos/create-source.dto.ts";

export class CreateSourceUseCase {
  constructor(
    private readonly sourcesRepository: ISourcesRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly idService: IIdService,
    private readonly logger: ILoggerService,
    private readonly queueService: IQueueService
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

    // Build job payload
    const jobPayload: ProcessSourcePayload = {
      sourceId,
      notebookId: dto.notebookId,
      type: dto.type,
      content: dto.content ?? undefined,
      url: dto.metadata?.url as string | undefined,
      fileBase64: dto.fileBuffer ? dto.fileBuffer.toString("base64") : undefined,
      originalFilename: dto.originalFilename ?? undefined,
    };

    // Dispatch async processing job
    try {
      await this.queueService.dispatch(PROCESS_SOURCE_JOB, jobPayload);
      this.logger.info("Source processing job dispatched", { sourceId });
    } catch (error) {
      this.logger.error("Failed to dispatch source processing job", {
        sourceId,
        error: (error as Error).message,
      });
      // Mark source as failed since processing won't happen
      source.markFailed("Failed to dispatch processing job");
      await this.sourcesRepository.update(source);
    }

    return CreateSourceResponseDto.toResponse(source);
  }
}
