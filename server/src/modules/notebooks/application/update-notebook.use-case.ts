import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, ConflictError, InternalError } from "../../../shared/core/api-error.ts";
import { NotebookEntity } from "../../../domain/entities/notebook.entity.ts";
import { UpdateNotebookRequestDto, UpdateNotebookResponseDto } from "./dtos/update-notebook.dto.ts";

export class UpdateNotebookUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: UpdateNotebookRequestDto): Promise<UpdateNotebookResponseDto> {
    this.logger.info("Updating notebook", { notebookId: dto.id, userId: dto.userId });

    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.id, dto.userId);

    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const newTitle = dto.title !== undefined ? dto.title : notebook.title;

    // Check for duplicate title if title is being changed
    if (dto.title !== undefined && dto.title !== notebook.title) {
      const existing = await this.notebooksRepository.findByTitleAndUserId(dto.title, dto.userId);
      if (existing) {
        this.logger.warn("Notebook with this title already exists", { userId: dto.userId, title: dto.title });
        throw new ConflictError("A notebook with this title already exists");
      }
    }

    const now = new Date();

    const updated = NotebookEntity.fromRecord({
      id: notebook.id,
      user_id: notebook.userId,
      title: newTitle,
      description: dto.description !== undefined ? dto.description : notebook.description,
      emoji: dto.emoji !== undefined ? dto.emoji : notebook.emoji,
      ai_provider: notebook.aiProvider,
      ai_model: notebook.aiModel,
      active_source_count: notebook.activeSourceCount,
      last_opened_at: notebook.lastOpenedAt,
      created_at: notebook.createdAt,
      updated_at: now,
      deleted_at: notebook.deletedAt,
    });

    try {
      await this.notebooksRepository.update(updated);
    } catch (error) {
      this.logger.error("Failed to update notebook", { notebookId: dto.id, error: (error as Error).message });
      throw new InternalError("Failed to update notebook - please try again");
    }

    this.logger.info("Notebook updated successfully", { notebookId: dto.id });

    return UpdateNotebookResponseDto.toResponse(updated);
  }
}
