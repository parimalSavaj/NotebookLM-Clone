import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, InternalError } from "../../../shared/core/api-error.ts";
import { DeleteNotebookRequestDto } from "./dtos/delete-notebook.dto.ts";

export class DeleteNotebookUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: DeleteNotebookRequestDto): Promise<void> {
    this.logger.info("Deleting notebook", { notebookId: dto.id, userId: dto.userId });

    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.id, dto.userId);

    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const now = new Date();

    try {
      await this.notebooksRepository.softDelete(dto.id, now);
    } catch (error) {
      this.logger.error("Failed to delete notebook", { notebookId: dto.id, error: (error as Error).message });
      throw new InternalError("Failed to delete notebook - please try again");
    }

    this.logger.info("Notebook deleted successfully", { notebookId: dto.id });
  }
}
