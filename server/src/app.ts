import express, { Express } from "express";
import cors from "cors";
import { config } from "./shared/config/index.ts";
import { IDatabaseService } from "./shared/services/database/database.service.interface.ts";
import { IIdService } from "./shared/services/id/id.service.interface.ts";
import { ILoggerService } from "./shared/services/logger/logger.service.interface.ts";
import { IChunkingService } from "./shared/services/chunking/chunking.service.interface.ts";
import { IPdfParserService } from "./shared/services/pdf-parser/pdf-parser.service.interface.ts";
import { IEmbeddingService } from "./infrastructure/external-services/embedding/embedding.external-service.interface.ts";
import { IFirecrawlService } from "./infrastructure/external-services/firecrawl/firecrawl.external-service.interface.ts";
import { ICloudinaryService } from "./infrastructure/external-services/cloudinary/cloudinary.external-service.interface.ts";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware.ts";
import { ErrorHandler } from "./shared/core/error-handler.ts";
import { IAuthService } from "./shared/services/auth/auth.service.interface.ts";
import { registerRoutes } from "./route-registry.ts";

interface AppDependencies {
  db: IDatabaseService;
  idService: IIdService;
  logger: ILoggerService;
  authService: IAuthService;
  chunkingService: IChunkingService;
  embeddingService: IEmbeddingService;
  firecrawlService: IFirecrawlService;
  cloudinaryService: ICloudinaryService;
  pdfParserService: IPdfParserService;
}

export function createApp({ db, idService, logger, authService, chunkingService, embeddingService, firecrawlService, cloudinaryService, pdfParserService }: AppDependencies): Express {
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
  registerRoutes({ app, db, idService, logger, chunkingService, embeddingService, firecrawlService, cloudinaryService, pdfParserService, authMiddleware });

  // Global error handler (must be LAST)
  app.use(errorHandler.handleError);

  return app;
}
