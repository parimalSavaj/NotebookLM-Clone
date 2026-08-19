import { IConversationsRepository } from "../../../infrastructure/repositories/conversations/conversations.repository.interface.ts";
import { IMessagesRepository } from "../../../infrastructure/repositories/messages/messages.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, ForbiddenError } from "../../../shared/core/api-error.ts";
import { GetMessagesRequestDto, GetMessagesResponseDto, MessageResponseDto } from "./dtos/get-messages.dto.ts";

export class GetMessagesUseCase {
  constructor(
    private readonly conversationsRepository: IConversationsRepository,
    private readonly messagesRepository: IMessagesRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(dto: GetMessagesRequestDto): Promise<GetMessagesResponseDto> {
    // Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(dto.notebookId, dto.userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    // Validate conversation ownership
    const conversation = await this.conversationsRepository.findByIdAndUserId(dto.conversationId, dto.userId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.notebook_id !== dto.notebookId) {
      throw new ForbiddenError("Conversation does not belong to this notebook");
    }

    const limit = dto.limit ?? 50;
    const messages = await this.messagesRepository.findByConversationId(dto.conversationId, {
      limit: limit + 1, // Fetch one extra to determine hasMore
      before: dto.before,
    });

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;

    const mapped: MessageResponseDto[] = resultMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      sourcesUsed: m.sources_used,
      createdAt: m.created_at.toISOString(),
    }));

    return { messages: mapped, hasMore };
  }
}
