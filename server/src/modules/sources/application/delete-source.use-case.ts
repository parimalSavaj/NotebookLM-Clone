import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { ISourceChunksRepository } from "../../../infrastructure/repositories/source-chunks/source-chunks.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, ForbiddenError } from "../../../shared/core/api-error.ts";
import { SourceStatus } from "../../../domain/enums/source-status.enum.ts";
import { DeleteSourceRequestDto } from "./dtos/delete-source.dto.ts";

export class DeleteSourceUseCase {
  constructor(
    private readonly sourcesRepository: ISourcesRepository,
    private readonly sourceChunksRepository: ISourceChunksRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: DeleteSourceRequestDto): Promise<void> {
    this.logger.info("Deleting source", { sourceId: dto.id, userId: dto.userId });

    // Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.notebookId, dto.userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const source = await this.sourcesRepository.findById(dto.id);
    if (!source) {
      throw new NotFoundError("Source not found");
    }

    // Verify source belongs to this notebook and user
    if (source.notebookId !== dto.notebookId || source.userId !== dto.userId) {
      throw new ForbiddenError("Access denied");
    }

    const wasCompleted = source.status === SourceStatus.COMPLETED;

    // Delete chunks first
    await this.sourceChunksRepository.deleteBySourceId(dto.id);

    // Soft delete the source
    await this.sourcesRepository.softDelete(dto.id, new Date());

    // Decrement notebook active_source_count if source was completed
    if (wasCompleted) {
      await this.notebooksRepository.decrementActiveSourceCount(dto.notebookId);
    }

    this.logger.info("Source deleted successfully", { sourceId: dto.id });
  }
}
