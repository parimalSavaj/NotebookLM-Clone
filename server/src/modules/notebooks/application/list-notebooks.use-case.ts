import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { ListNotebooksRequestDto, ListNotebooksResponseDto } from "./dtos/list-notebooks.dto.ts";

export class ListNotebooksUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: ListNotebooksRequestDto): Promise<ListNotebooksResponseDto[]> {
    this.logger.info("Listing notebooks", { userId: dto.userId });

    const notebooks = await this.notebooksRepository.findAllByUserId(dto.userId);

    return notebooks.map((notebook) => ListNotebooksResponseDto.toResponse(notebook));
  }
}
