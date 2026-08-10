import { Router } from "express";
import { IDatabaseService } from "../../../shared/services/database/database.service.interface.ts";
import { IIdService } from "../../../shared/services/id/id.service.interface.ts";
import { ILoggerService } from "../../../shared/services/logger/logger.service.interface.ts";
import { AuthMiddleware } from "../../../shared/middlewares/auth.middleware.ts";
import { ValidationMiddleware } from "../../../shared/middlewares/validate.middleware.ts";
import { NotebooksFactory } from "../notebooks.factory.ts";
import {
  createNotebookBodySchema,
  notebookParamsSchema,
  updateNotebookBodySchema,
  updateNotebookSettingsBodySchema,
} from "./notebooks.validation.ts";

export class NotebooksRoutes {
  private readonly router: Router;
  private readonly controller;

  constructor(
    db: IDatabaseService,
    idService: IIdService,
    logger: ILoggerService,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.controller = NotebooksFactory.create(db, idService, logger);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post(
      "/",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateBody(createNotebookBodySchema),
      this.controller.create
    );

    this.router.get(
      "/",
      this.authMiddleware.authenticate,
      this.controller.list
    );

    this.router.get(
      "/:id",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(notebookParamsSchema),
      this.controller.get
    );

    this.router.patch(
      "/:id",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(notebookParamsSchema),
      ValidationMiddleware.validateBody(updateNotebookBodySchema),
      this.controller.update
    );

    this.router.patch(
      "/:id/settings",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(notebookParamsSchema),
      ValidationMiddleware.validateBody(updateNotebookSettingsBodySchema),
      this.controller.updateSettings
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.authenticate,
      ValidationMiddleware.validateParams(notebookParamsSchema),
      this.controller.delete
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
