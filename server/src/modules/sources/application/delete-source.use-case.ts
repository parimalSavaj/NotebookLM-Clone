import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { ISourceChunksRepository } from "../../../infrastructure/repositories/source-chunks/source-chunks.repository.interface.ts";
import { ISourceContentsRepository } from "../../../infrastructure/repositories/source-contents/source-contents.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, ForbiddenError, InternalError } from "../../../shared/core/api-error.ts";
import { SourceStatus } from "../../../domain/enums/source-status.enum.ts";
import { DeleteSourceRequestDto } from "./dtos/delete-source.dto.ts";

export class DeleteSourceUseCase {
  constructor(
    private readonly sourcesRepository: ISourcesRepository,
    private readonly sourceChunksRepository: ISourceChunksRepository,
    private readonly sourceContentsRepository: ISourceContentsRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly db: IDatabaseService,
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
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Delete chunks (embeddings) first
      await this.sourceChunksRepository.deleteBySourceId(dto.id, client);

      // Delete full content
      await this.sourceContentsRepository.deleteBySourceId(dto.id, client);

      // Soft delete the source
      await this.sourcesRepository.softDelete(dto.id, new Date(), client);

      // Decrement notebook active_source_count if source was completed
      if (wasCompleted) {
        await this.notebooksRepository.decrementActiveSourceCount(dto.notebookId, client);
      }

      await client.query('COMMIT');
      this.logger.info("Source deleted successfully", { sourceId: dto.id });
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error("Failed to delete source", { sourceId: dto.id, error: (error as Error).message });
      throw new InternalError("Failed to delete source - please try again");
    } finally {
      client.release();
    }
  }
}
