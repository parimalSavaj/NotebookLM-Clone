import { HTTP_STATUS } from "../constants/status-code.constants.ts";

export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = "Validation failed") {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class InternalError extends ApiError {
  constructor(message: string = "Internal server error") {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
