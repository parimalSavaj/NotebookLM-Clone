export type JobOptions = {
  /** Unique job ID — for idempotency. If not provided, auto-generated. */
  jobId?: string;

  /** Number of retry attempts before moving to dead-letter. Default: 3 */
  maxRetries?: number;

  /** Priority level (lower number = higher priority). Default: 0 (normal) */
  priority?: number;

  /** Backoff strategy between retries. Default: exponential */
  backoff?: "fixed" | "exponential";

  /** Initial backoff delay in milliseconds. Default: 1000 */
  backoffDelay?: number;
};

export type JobStatus = {
  id: string;
  name: string;
  state: "waiting" | "active" | "completed" | "failed" | "dead-letter";
  attempts: number;
  maxRetries: number;
  createdAt: string;
  processedAt: string | null;
  failedReason: string | null;
};
