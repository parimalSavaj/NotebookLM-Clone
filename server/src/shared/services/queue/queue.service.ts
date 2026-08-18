import { Inngest } from "inngest";
import { serve } from "inngest/express";
import { IQueueService } from "./queue.service.interface.ts";
import { JobOptions } from "./queue.types.ts";

/**
 * Queue service implementation backed by Inngest.
 * Inngest uses an event-driven model — dispatching sends an event,
 * and registered functions (workers) react to those events.
 */
export class QueueService implements IQueueService {
  private static instance: QueueService;
  private readonly client: Inngest;
  private functions: Array<unknown> = [];

  private constructor() {
    this.client = new Inngest({ id: "notebooklm" });
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Get the underlying Inngest client for function registration.
   * Used by the jobs registry to create Inngest functions.
   */
  getClient(): Inngest {
    return this.client;
  }

  /**
   * Register Inngest functions (called by the job registry at startup).
   */
  registerFunctions(fns: Array<unknown>): void {
    this.functions = fns;
  }

  async dispatch<TPayload>(jobName: string, payload: TPayload, _options?: JobOptions): Promise<void> {
    await this.client.send({
      name: jobName,
      data: payload as Record<string, unknown>,
    });
  }

  /**
   * Returns the Inngest serve middleware for Express.
   */
  getRequestHandler(): ReturnType<typeof serve> {
    return serve({
      client: this.client,
      functions: this.functions as Parameters<typeof serve>[0]["functions"],
    });
  }
}
