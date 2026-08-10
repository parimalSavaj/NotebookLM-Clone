import { Request, Response, NextFunction } from "express";
import { ApiError } from "./api-error.ts";
import { HTTP_STATUS } from "../constants/status-code.constants.ts";
import { ILoggerService } from "../services/logger/logger.service.interface.ts";

export class ErrorHandler {
  constructor(private readonly logger: ILoggerService) {}

  handleError = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    this.logger.error("Unhandled error", { error: error.message, stack: error.stack });

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  };
}
