import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { ISourceContentsRepository } from "../../../infrastructure/repositories/source-contents/source-contents.repository.interface.ts";
import { ISourceChunksRepository } from "../../../infrastructure/repositories/source-chunks/source-chunks.repository.interface.ts";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, InternalError } from "../../../shared/core/api-error.ts";
import { DeleteNotebookRequestDto } from "./dtos/delete-notebook.dto.ts";

export class DeleteNotebookUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly sourcesRepository: ISourcesRepository,
    private readonly sourceContentsRepository: ISourceContentsRepository,
    private readonly sourceChunksRepository: ISourceChunksRepository,
    private readonly db: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: DeleteNotebookRequestDto): Promise<void> {
    this.logger.info("Deleting notebook", { notebookId: dto.id, userId: dto.userId });

    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.id, dto.userId);

    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const now = new Date();
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Hard delete all chunks/embeddings for this notebook
      await this.sourceChunksRepository.deleteByNotebookId(dto.id, client);

      // 2. Hard delete all source_contents for this notebook's sources
      await this.sourceContentsRepository.deleteByNotebookId(dto.id, client);

      // 3. Soft delete all sources belonging to this notebook
      await this.sourcesRepository.softDeleteByNotebookId(dto.id, now, client);

      // 4. Soft delete the notebook itself
      await this.notebooksRepository.softDelete(dto.id, now, client);

      await client.query('COMMIT');
      this.logger.info("Notebook deleted successfully", { notebookId: dto.id });
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error("Failed to delete notebook", { notebookId: dto.id, error: (error as Error).message });
      throw new InternalError("Failed to delete notebook - please try again");
    } finally {
      client.release();
    }
  }
}
