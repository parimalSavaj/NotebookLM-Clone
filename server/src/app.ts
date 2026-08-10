import express, { Express } from "express";
import cors from "cors";
import { config } from "./shared/config/index.ts";
import { IDatabaseService } from "./shared/services/database/database.service.interface.ts";
import { IIdService } from "./shared/services/id/id.service.interface.ts";
import { ILoggerService } from "./shared/services/logger/logger.service.interface.ts";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware.ts";
import { ErrorHandler } from "./shared/core/error-handler.ts";
import { IAuthService } from "./shared/services/auth/auth.service.interface.ts";
import { registerRoutes } from "./route-registry.ts";

interface AppDependencies {
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  authService: IAuthService;
}

export function createApp({ db, idService, logger, authService }: AppDependencies): Express {
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

  // Feature module routes
  registerRoutes({ app, db, idService, logger, authMiddleware });

  // Global error handler (must be LAST)
  app.use(errorHandler.handleError);

  return app;
}
