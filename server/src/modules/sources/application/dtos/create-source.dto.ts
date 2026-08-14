import { Request } from "express";
import { SourceType } from "../../../../domain/enums/source-type.enum.ts";
import { SourceMetadata } from "../../../../domain/entities/source.entity.ts";

export class CreateSourceRequestDto {
  notebookId: string;
  userId: string;
  title: string;
  type: SourceType;
  content: string | null;
  fileBuffer: Buffer | null;
  originalFilename: string | null;
  metadata: SourceMetadata;

  private constructor(props: {
    notebookId: string;
    userId: string;
    title: string;
    type: SourceType;
    content: string | null;
    fileBuffer: Buffer | null;
    originalFilename: string | null;
    metadata: SourceMetadata;
  }) {
    this.notebookId = props.notebookId;
    this.userId = props.userId;
    this.title = props.title;
    this.type = props.type;
    this.content = props.content;
    this.fileBuffer = props.fileBuffer;
    this.originalFilename = props.originalFilename;
    this.metadata = props.metadata;
  }

  static fromRequest(req: Request): CreateSourceRequestDto {
    return new CreateSourceRequestDto({
      notebookId: req.params.notebookId as string,
      userId: req.user!.id,
      title: req.body.title,
      type: req.body.type,
      content: req.body.content ?? null,
      fileBuffer: req.file?.buffer ?? null,
      originalFilename: req.file?.originalname ?? null,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
    });
  }
}

export class CreateSourceResponseDto {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  type: string;
  status: string;
  metadata: SourceMetadata;
  fileSize: number | null;
  chunkCount: number;
  charCount: number;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;

  private constructor(props: {
    id: string;
    notebookId: string;
    userId: string;
    title: string;
    type: string;
    status: string;
    metadata: SourceMetadata;
    fileSize: number | null;
    chunkCount: number;
    charCount: number;
    errorMessage: string | null;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = props.id;
    this.notebookId = props.notebookId;
    this.userId = props.userId;
    this.title = props.title;
    this.type = props.type;
    this.status = props.status;
    this.metadata = props.metadata;
    this.fileSize = props.fileSize;
    this.chunkCount = props.chunkCount;
    this.charCount = props.charCount;
    this.errorMessage = props.errorMessage;
    this.processedAt = props.processedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static toResponse(entity: {
    id: string;
    notebookId: string;
    userId: string;
    title: string;
    type: string;
    status: string;
    metadata: SourceMetadata;
    fileSize: number | null;
    chunkCount: number;
    charCount: number;
    errorMessage: string | null;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): CreateSourceResponseDto {
    return new CreateSourceResponseDto({
      id: entity.id,
      notebookId: entity.notebookId,
      userId: entity.userId,
      title: entity.title,
      type: entity.type,
      status: entity.status,
      metadata: entity.metadata,
      fileSize: entity.fileSize,
      chunkCount: entity.chunkCount,
      charCount: entity.charCount,
      errorMessage: entity.errorMessage,
      processedAt: entity.processedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    });
  }
}
