import { IDatabaseService } from "../../shared/services/database/database.service.interface.ts";
import { IIdService } from "../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../shared/services/logger/logger.service.interface.ts";
import { IRetrievalService } from "../../shared/services/retrieval/retrieval.service.interface.ts";
import { ILlmService } from "../../infrastructure/external-services/llm/llm.external-service.interface.ts";
import { IQueueService } from "../../shared/services/queue/queue.service.interface.ts";
import { IWebSearchService } from "../../infrastructure/external-services/tavily/tavily.external-service.interface.ts";
import { ConversationsRepository } from "../../infrastructure/repositories/conversations/conversations.repository.ts";
import { MessagesRepository } from "../../infrastructure/repositories/messages/messages.repository.ts";
import { NotebooksRepository } from "../../infrastructure/repositories/notebooks/notebooks.repository.ts";
import { SourcesRepository } from "../../infrastructure/repositories/sources/sources.repository.ts";
import { SendMessageUseCase } from "./application/send-message.use-case.ts";
import { ListConversationsUseCase } from "./application/list-conversations.use-case.ts";
import { GetMessagesUseCase } from "./application/get-messages.use-case.ts";
import { DeleteConversationUseCase } from "./application/delete-conversation.use-case.ts";
import { ChatController } from "./presentation/chat.controller.ts";

export class ChatFactory {
  static create(
    db: IDatabaseService,
    idService: IIdService,
    logger: ILoggerService,
    retrievalService: IRetrievalService,
    llmService: ILlmService,
    queueService: IQueueService,
    webSearchService: IWebSearchService
  ): ChatController {
    const conversationsRepository = new ConversationsRepository(db);
    const messagesRepository = new MessagesRepository(db);
    const notebooksRepository = new NotebooksRepository(db);
    const sourcesRepository = new SourcesRepository(db);

    const sendMessageUseCase = new SendMessageUseCase(
      conversationsRepository,
      messagesRepository,
      notebooksRepository,
      sourcesRepository,
      retrievalService,
      llmService,
      queueService,
      webSearchService,
      idService,
      logger
    );

    const listConversationsUseCase = new ListConversationsUseCase(
      conversationsRepository,
      notebooksRepository,
      logger
    );

    const getMessagesUseCase = new GetMessagesUseCase(
      conversationsRepository,
      messagesRepository,
      notebooksRepository,
      sourcesRepository,
      logger
    );

    const deleteConversationUseCase = new DeleteConversationUseCase(
      conversationsRepository,
      notebooksRepository,
      logger
    );

    return new ChatController(
      sendMessageUseCase,
      listConversationsUseCase,
      getMessagesUseCase,
      deleteConversationUseCase
    );
  }
}
