import { IConversationsRepository } from "../../../infrastructure/repositories/conversations/conversations.repository.interface.ts";
import { INotebooksRepository } from "../../../infrastructure/repositories/notebooks/notebooks.repository.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { NotFoundError, ForbiddenError } from "../../../shared/core/api-error.ts";

export class DeleteConversationUseCase {
  constructor(
    private readonly conversationsRepository: IConversationsRepository,
    private readonly notebooksRepository: INotebooksRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(notebookId: string, conversationId: string, userId: string): Promise<void> {
    // Validate notebook ownership
    const notebook = await this.notebooksRepository.findByIdAndUserId(notebookId, userId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    // Validate conversation ownership
    const conversation = await this.conversationsRepository.findByIdAndUserId(conversationId, userId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.notebook_id !== notebookId) {
      throw new ForbiddenError("Conversation does not belong to this notebook");
    }

    // CASCADE will delete all messages
    await this.conversationsRepository.delete(conversationId);

    this.logger.info("Conversation deleted", { conversationId, notebookId });
  }
}
