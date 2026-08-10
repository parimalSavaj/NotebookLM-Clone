import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod/v4";
import { ValidationError } from "../core/api-error.ts";

export class ValidationMiddleware {
  static validateBody(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const message = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        next(new ValidationError(message));
        return;
      }

      req.body = result.data;
      next();
    };
  }

  static validateParams(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const message = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        next(new ValidationError(message));
        return;
      }

      req.params = result.data as typeof req.params;
      next();
    };
  }

  static validateQuery(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const message = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        next(new ValidationError(message));
        return;
      }

      req.query = result.data as typeof req.query;
      next();
    };
  }
}
