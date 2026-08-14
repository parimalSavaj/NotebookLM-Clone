import { Router } from "express";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { IChunkingService } from "../../../shared/services/chunking/chunking.service.interface.ts";
import { IPdfParserService } from "../../../shared/services/pdf-parser/pdf-parser.service.interface.ts";
import { IEmbeddingService } from "../../../infrastructure/external-services/embedding/embedding.external-service.interface.ts";
import { IFirecrawlService } from "../../../infrastructure/external-services/firecrawl/firecrawl.external-service.interface.ts";
import { ICloudinaryService } from "../../../infrastructure/external-services/cloudinary/cloudinary.external-service.interface.ts";
import { AuthMiddleware } from "../../../shared/middlewares/auth.middleware.ts";
import { ValidationMiddleware } from "../../../shared/middlewares/validate.middleware.ts";
import { UploadMiddleware } from "../../../shared/middlewares/upload.middleware.ts";
import { SourcesFactory } from "../sources.factory.ts";
import {
  sourceNotebookParamsSchema,
  sourceParamsSchema,
  createSourceBodySchema,
} from "./sources.validation.ts";

export class SourcesRoutes {
  private readonly router: Router;
  private readonly controller;

  constructor(
    db: IDatabaseService,
    idService: IIdService,
    logger: ILoggerService,
    chunkingService: IChunkingService,
    embeddingService: IEmbeddingService,
    firecrawlService: IFirecrawlService,
    cloudinaryService: ICloudinaryService,
    pdfParserService: IPdfParserService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router({ mergeParams: true });
    this.controller = SourcesFactory.create(db, idService, logger, chunkingService, embeddingService, firecrawlService, cloudinaryService, pdfParserService);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // JSON-based source creation (text, markdown, url)
    this.router.post(
      "/",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(sourceNotebookParamsSchema),
      ValidationMiddleware.validateBody(createSourceBodySchema),
      this.controller.create
    );

    // File-based source creation (PDF upload)
    this.router.post(
      "/upload",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(sourceNotebookParamsSchema),
      UploadMiddleware.pdf(),
      this.controller.create
    );

    this.router.get(
      "/",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(sourceNotebookParamsSchema),
      this.controller.list
    );

    this.router.get(
      "/:id",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(sourceParamsSchema),
      this.controller.get
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(sourceParamsSchema),
      this.controller.delete
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
