import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { ConflictError, InternalError } from "../../../shared/core/api-error.ts";
import { NotebookEntity } from "../../../domain/entities/notebook.entity.ts";
import { CreateNotebookRequestDto, CreateNotebookResponseDto } from "./dtos/create-notebook.dto.ts";

export class CreateNotebookUseCase {
  constructor(
    private readonly notebooksRepository: INotebooksRepository,
    private readonly idService: IIdService,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: CreateNotebookRequestDto): Promise<CreateNotebookResponseDto> {
    this.logger.info("Creating notebook", { userId: dto.userId, title: dto.title });

    const existing = await this.notebooksRepository.findByTitleAndUserId(dto.title, dto.userId);

    if (existing) {
      this.logger.warn("Notebook with this title already exists", { userId: dto.userId, title: dto.title });
      throw new ConflictError("A notebook with this title already exists");
    }

    const id = this.idService.generate();

    const notebook = NotebookEntity.create({
      id,
      userId: dto.userId,
      title: dto.title,
      description: dto.description,
      emoji: dto.emoji,
    });

    try {
      await this.notebooksRepository.create(notebook);
    } catch (error) {
      this.logger.error("Failed to create notebook", { userId: dto.userId, error: (error as Error).message });
      throw new InternalError("Failed to create notebook - please try again");
    }

    this.logger.info("Notebook created successfully", { notebookId: id, userId: dto.userId });

    return CreateNotebookResponseDto.toResponse(notebook);
  }
}
