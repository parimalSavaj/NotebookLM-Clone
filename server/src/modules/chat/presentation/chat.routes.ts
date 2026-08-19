import { Router } from "express";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { IRetrievalService } from "../../../shared/services/retrieval/retrieval.service.interface.ts";
import { ILlmService } from "../../../infrastructure/external-services/llm/llm.external-service.interface.ts";
import { AuthMiddleware } from "../../../shared/middlewares/auth.middleware.ts";
import { ValidationMiddleware } from "../../../shared/middlewares/validate.middleware.ts";
import { ChatFactory } from "../chat.factory.ts";
import {
  chatNotebookParamsSchema,
  chatConversationParamsSchema,
  sendMessageBodySchema,
} from "./chat.validation.ts";

export class ChatRoutes {
  private readonly router: Router;
  private readonly controller;

  constructor(
    db: IDatabaseService,
    idService: IIdService,
    logger: ILoggerService,
    retrievalService: IRetrievalService,
    llmService: ILlmService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router({ mergeParams: true });
    this.controller = ChatFactory.create(db, idService, logger, retrievalService, llmService);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Send message (streaming)
    this.router.post(
      "/chat",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(chatNotebookParamsSchema),
      ValidationMiddleware.validateBody(sendMessageBodySchema),
      this.controller.sendMessage
    );

    // List conversations
    this.router.get(
      "/conversations",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(chatNotebookParamsSchema),
      this.controller.listConversations
    );

    // Get messages for a conversation
    this.router.get(
      "/conversations/:conversationId/messages",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(chatConversationParamsSchema),
      this.controller.getMessages
    );

    // Delete a conversation
    this.router.delete(
      "/conversations/:conversationId",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(chatConversationParamsSchema),
      this.controller.deleteConversation
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
