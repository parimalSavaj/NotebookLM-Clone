import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod/v4";
import { ValidationError } from "../core/api-error.ts";

function formatErrors(issues: { path: PropertyKey[]; message: string }[]): string {
  if (issues.length === 1) {
    return issues[0].message;
  }
  return issues.map((issue) => issue.message).join(", ");
}

export class ValidationMiddleware {
  static validateBody(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        next(new ValidationError(formatErrors(result.error.issues)));
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
        next(new ValidationError(formatErrors(result.error.issues)));
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
        next(new ValidationError(formatErrors(result.error.issues)));
        return;
      }

      req.query = result.data as typeof req.query;
      next();
    };
  }
}
