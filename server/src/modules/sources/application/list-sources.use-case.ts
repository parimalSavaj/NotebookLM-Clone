import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError } from "../../../shared/core/api-error.ts";
import { ListSourcesRequestDto, ListSourcesResponseDto } from "./dtos/list-sources.dto.ts";

export class ListSourcesUseCase {
  constructor(
    private readonly sourcesRepository: ISourcesRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: ListSourcesRequestDto): Promise<ListSourcesResponseDto[]> {
    this.logger.info("Listing sources", { notebookId: dto.notebookId, userId: dto.userId });

    // Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.notebookId, dto.userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const sources = await this.sourcesRepository.findAllByNotebookId(dto.notebookId, dto.userId);

    return sources.map((source) => ListSourcesResponseDto.toResponse(source));
  }
}
