import { Express } from "express";
import { IDatabaseService } from "./shared/services/database/database.service.interface.ts";
import { IIdService } from "./shared/services/id/id.service.interface.ts";
import { ILoggerService } from "./shared/services/logger/logger.service.interface.ts";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware.ts";
import { NotebooksRoutes } from "./modules/notebooks/presentation/notebooks.routes.ts";

interface RouteDependencies {
  app: Express;
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  authMiddleware: AuthMiddleware;
}

export function registerRoutes({ app, db, idService, logger, authMiddleware }: RouteDependencies): void {
  // Feature modules
  const notebooksRoutes = new NotebooksRoutes(db, idService, logger, authMiddleware);
  app.use("/api/notebooks", notebooksRoutes.getRouter());

  // Future modules go here:
  // const sourcesRoutes = new SourcesRoutes(db, idService, logger, authMiddleware);
  // app.use("/api/sources", sourcesRoutes.getRouter());
  //
  // const chatRoutes = new ChatRoutes(db, idService, logger, authMiddleware);
  // app.use("/api/chat", chatRoutes.getRouter());
}
