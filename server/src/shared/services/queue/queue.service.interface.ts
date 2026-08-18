import { JobOptions } from "./queue.types.ts";

export interface IQueueService {
  /**
   * Dispatch a job to be processed asynchronously.
   * Fire-and-forget — returns once the job is enqueued, not when it completes.
   */
  dispatch<TPayload>(jobName: string, payload: TPayload, options?: JobOptions): Promise<void>;

  /**
   * Get the Express request handler for the queue backend (e.g., Inngest serve endpoint).
   * Returns undefined if the queue does not expose an HTTP endpoint.
   */
  getRequestHandler(): unknown;
}
