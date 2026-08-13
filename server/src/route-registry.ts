import { Express } from "express";
import { IDatabaseService } from "./shared/services/database/database.service.interface.ts";
import { IIdService } from "./shared/services/id/id.service.interface.ts";
import { ILoggerService } from "./shared/services/logger/logger.service.interface.ts";
import { IChunkingService } from "./shared/services/chunking/chunking.service.interface.ts";
import { IEmbeddingService } from "./infrastructure/external-services/embedding/embedding.external-service.interface.ts";
import { IFirecrawlService } from "./infrastructure/external-services/firecrawl/firecrawl.external-service.interface.ts";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware.ts";
import { NotebooksRoutes } from "./modules/notebooks/presentation/notebooks.routes.ts";
import { SourcesRoutes } from "./modules/sources/presentation/sources.routes.ts";

interface RouteDependencies {
  app: Express;
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  chunkingService: IChunkingService;
  embeddingService: IEmbeddingService;
  firecrawlService: IFirecrawlService;
  authMiddleware: AuthMiddleware;
}

export function registerRoutes({ app, db, idService, logger, chunkingService, embeddingService, firecrawlService, authMiddleware }: RouteDependencies): void {
  // Feature modules
  const notebooksRoutes = new NotebooksRoutes(db, idService, logger, authMiddleware);
  app.use("/api/notebooks", notebooksRoutes.getRouter());

  const sourcesRoutes = new SourcesRoutes(db, idService, logger, chunkingService, embeddingService, firecrawlService, authMiddleware);
  app.use("/api/notebooks/:notebookId/sources", sourcesRoutes.getRouter());
}
