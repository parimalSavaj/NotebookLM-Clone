import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, InternalError } from "../../../shared/core/api-error.ts";
import { NotebookEntity } from "../../../domain/entities/notebook.entity.ts";
import { UpdateNotebookSettingsRequestDto, UpdateNotebookSettingsResponseDto } from "./dtos/update-notebook-settings.dto.ts";

export class UpdateNotebookSettingsUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: UpdateNotebookSettingsRequestDto): Promise<UpdateNotebookSettingsResponseDto> {
    this.logger.info("Updating notebook settings", { notebookId: dto.id, userId: dto.userId });

    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.id, dto.userId);

    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const now = new Date();

    const updated = NotebookEntity.fromRecord({
      id: notebook.id,
      user_id: notebook.userId,
      title: notebook.title,
      description: notebook.description,
      emoji: notebook.emoji,
      ai_provider: dto.aiProvider,
      ai_model: dto.aiModel,
      active_source_count: notebook.activeSourceCount,
      last_opened_at: notebook.lastOpenedAt,
      created_at: notebook.createdAt,
      updated_at: now,
      deleted_at: notebook.deletedAt,
    });

    try {
      await this.notebooksRepository.update(updated);
    } catch (error) {
      this.logger.error("Failed to update notebook settings", { notebookId: dto.id, error: (error as Error).message });
      throw new InternalError("Failed to update notebook settings - please try again");
    }

    this.logger.info("Notebook settings updated successfully", { notebookId: dto.id });

    return UpdateNotebookSettingsResponseDto.toResponse(updated);
  }
}
