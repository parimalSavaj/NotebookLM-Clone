import { ILoggerService } from "./logger.service.interface.ts";

export class LoggerService implements ILoggerService {
  private static instance: LoggerService | null = null;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : "");
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : "");
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : "");
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : "");
  }
}
