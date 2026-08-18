/**
 * Throw this error inside a job worker when retrying would never succeed.
 * The queue system should move the job to dead-letter immediately.
 */
export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetryableError";
  }
}
