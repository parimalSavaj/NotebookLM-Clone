import { IConversationsRepository } from "../../../infrastructure/repositories/conversations/conversations.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError } from "../../../shared/core/api-error.ts";
import { ListConversationsRequestDto, ConversationResponseDto } from "./dtos/list-conversations.dto.ts";

export class ListConversationsUseCase {
  constructor(
    private readonly conversationsRepository: IConversationsRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: ListConversationsRequestDto): Promise<ConversationResponseDto[]> {
    // Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.notebookId, dto.userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    const conversations = await this.conversationsRepository.findAllByNotebookId(dto.notebookId, dto.userId);

    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      messageCount: c.message_count,
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at.toISOString(),
    }));
  }
}
