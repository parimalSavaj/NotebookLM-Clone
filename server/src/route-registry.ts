import { Express } from "express";
import { IDatabaseService } from "./shared/services/database/database.service.interface.ts";
import { IIdService } from "./shared/services/id/id.service.interface.ts";
import { ILoggerService } from "./shared/services/logger/logger.service.interface.ts";
import { IQueueService } from "./shared/services/queue/queue.service.interface.ts";
import { IRetrievalService } from "./shared/services/retrieval/retrieval.service.interface.ts";
import { ILlmService } from "./infrastructure/external-services/llm/llm.external-service.interface.ts";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware.ts";
import { NotebooksRoutes } from "./modules/notebooks/presentation/notebooks.routes.ts";
import { SourcesRoutes } from "./modules/sources/presentation/sources.routes.ts";
import { ChatRoutes } from "./modules/chat/presentation/chat.routes.ts";

interface RouteDependencies {
  app: Express;
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  queueService: IQueueService;
  retrievalService: IRetrievalService;
  llmService: ILlmService;
  authMiddleware: AuthMiddleware;
}

export function registerRoutes({ app, db, idService, logger, queueService, retrievalService, llmService, authMiddleware }: RouteDependencies): void {
  // Feature modules
  const notebooksRoutes = new NotebooksRoutes(db, idService, logger, authMiddleware);
  app.use("/api/notebooks", notebooksRoutes.getRouter());

  const sourcesRoutes = new SourcesRoutes(db, idService, logger, queueService, authMiddleware);
  app.use("/api/notebooks/:notebookId/sources", sourcesRoutes.getRouter());

  const chatRoutes = new ChatRoutes(db, idService, logger, retrievalService, llmService, queueService, authMiddleware);
  app.use("/api/notebooks/:notebookId", chatRoutes.getRouter());
}
