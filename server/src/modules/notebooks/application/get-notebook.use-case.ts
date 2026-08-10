import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError } from "../../../shared/core/api-error.ts";
import { GetNotebookRequestDto, GetNotebookResponseDto } from "./dtos/get-notebook.dto.ts";

export class GetNotebookUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: GetNotebookRequestDto): Promise<GetNotebookResponseDto> {
    this.logger.info("Getting notebook", { notebookId: dto.id, userId: dto.userId });

    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.id, dto.userId);

    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    return GetNotebookResponseDto.toResponse(notebook);
  }
}
