import { ISourcesRepository } from "../../../infrastructure/repositories/sources/sources.repository.interface.ts";
import { ISourceContentsRepository } from "../../../infrastructure/repositories/source-contents/source-contents.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, ForbiddenError } from "../../../shared/core/api-error.ts";
import { GetSourceRequestDto, GetSourceResponseDto } from "./dtos/get-source.dto.ts";

export class GetSourceUseCase {
  constructor(
    private readonly sourcesRepository: ISourcesRepository,
    private readonly sourceContentsRepository: ISourceContentsRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: GetSourceRequestDto): Promise<GetSourceResponseDto> {
    this.logger.info("Getting source", { sourceId: dto.id, userId: dto.userId });

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

    // Fetch content if available
    const contentRow = await this.sourceContentsRepository.findBySourceId(dto.id);
    const content = contentRow?.content ?? null;

    return GetSourceResponseDto.toResponse(source, content);
  }
}
