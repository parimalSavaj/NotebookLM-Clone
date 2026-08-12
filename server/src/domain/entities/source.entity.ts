import { SourceStatus } from "../enums/source-status.enum.ts";
import { SourceType } from "../enums/source-type.enum.ts";

export type SourceMetadata = Record<string, unknown>;

export class SourceEntity {
  private constructor(
    private readonly _id: string,
    private readonly _notebookId: string,
    private readonly _userId: string,
    private readonly _title: string,
    private readonly _type: SourceType,
    private _status: SourceStatus,
    private readonly _metadata: SourceMetadata,
    private readonly _fileSize: number | null,
    private _chunkCount: number,
    private _charCount: number,
    private _errorMessage: string | null,
    private _processedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _deletedAt: Date | null
  ) {}

  static create(props: {
    id: string;
    notebookId: string;
    userId: string;
    title: string;
    type: SourceType;
    metadata?: SourceMetadata;
    fileSize?: number | null;
  }): SourceEntity {
    const now = new Date();
    return new SourceEntity(
      props.id,
      props.notebookId,
      props.userId,
      props.title,
      props.type,
      SourceStatus.PENDING,
      props.metadata ?? {},
      props.fileSize ?? null,
      0,
      0,
      null,
      null,
      now,
      now,
      null
    );
  }

  static fromRecord(row: {
    id: string;
    notebook_id: string;
    user_id: string;
    title: string;
    type: string;
    status: string;
    metadata: SourceMetadata;
    file_size: number | null;
    chunk_count: number;
    char_count: number;
    error_message: string | null;
    processed_at: Date | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): SourceEntity {
    return new SourceEntity(
      row.id,
      row.notebook_id,
      row.user_id,
      row.title,
      row.type as SourceType,
      row.status as SourceStatus,
      row.metadata,
      row.file_size,
      row.chunk_count,
      row.char_count,
      row.error_message,
      row.processed_at,
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }

  markProcessing(): void {
    this._status = SourceStatus.PROCESSING;
    this._updatedAt = new Date();
  }

  markCompleted(stats: { chunkCount: number; charCount: number }): void {
    this._status = SourceStatus.COMPLETED;
    this._chunkCount = stats.chunkCount;
    this._charCount = stats.charCount;
    this._processedAt = new Date();
    this._updatedAt = new Date();
  }

  markFailed(errorMessage: string): void {
    this._status = SourceStatus.FAILED;
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get notebookId(): string {
    return this._notebookId;
  }

  get userId(): string {
    return this._userId;
  }

  get title(): string {
    return this._title;
  }

  get type(): SourceType {
    return this._type;
  }

  get status(): SourceStatus {
    return this._status;
  }

  get metadata(): SourceMetadata {
    return this._metadata;
  }

  get fileSize(): number | null {
    return this._fileSize;
  }

  get chunkCount(): number {
    return this._chunkCount;
  }

  get charCount(): number {
    return this._charCount;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  get processedAt(): Date | null {
    return this._processedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  get isCompleted(): boolean {
    return this._status === SourceStatus.COMPLETED;
  }
}
