import express, { Express } from "express";
import cors from "cors";
import { config } from "./shared/config/index.ts";
import { IDatabaseService } from "./shared/services/database/database.service.interface.ts";
import { IIdService } from "./shared/services/id/id.service.interface.ts";
import { ILoggerService } from "./shared/services/logger/logger.service.interface.ts";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware.ts";
import { ErrorHandler } from "./shared/core/error-handler.ts";
import { IAuthService } from "./shared/services/auth/auth.service.interface.ts";
import { IQueueService } from "./shared/services/queue/queue.service.interface.ts";
import { IRetrievalService } from "./shared/services/retrieval/retrieval.service.interface.ts";
import { ILlmService } from "./infrastructure/external-services/llm/llm.external-service.interface.ts";
import { registerRoutes } from "./route-registry.ts";

interface AppDependencies {
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  authService: IAuthService;
  queueService: IQueueService;
  retrievalService: IRetrievalService;
  llmService: ILlmService;
}

export function createApp({ db, idService, logger, authService, queueService, retrievalService, llmService }: AppDependencies): Express {
  const app = express();

  // Initialize middlewares
  const authMiddleware = new AuthMiddleware(authService);
  const errorHandler = new ErrorHandler(logger);

  // CORS
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Better Auth handler - must be BEFORE express.json()
  app.all("/api/auth/*splat", (req, res) => {
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    return authService.getAuthHandler()(req, res);
  });

  // Body parser - AFTER Better Auth
  app.use(express.json());

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Queue service endpoint for background job execution
  const handler = queueService.getRequestHandler();
  if (handler) {
    app.use("/api/inngest", handler as express.RequestHandler);
  }

  // Feature module routes
  registerRoutes({ app, db, idService, logger, queueService, retrievalService, llmService, authMiddleware });

  // Global error handler (must be LAST)
  app.use(errorHandler.handleError);

  return app;
}
