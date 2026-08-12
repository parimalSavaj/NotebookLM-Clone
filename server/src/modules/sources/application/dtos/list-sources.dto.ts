import { Request } from "express";
import { SourceMetadata } from "../../../../domain/entities/source.entity.ts";

export class ListSourcesRequestDto {
  notebookId: string;
  userId: string;

  private constructor(props: { notebookId: string; userId: string }) {
    this.notebookId = props.notebookId;
    this.userId = props.userId;
  }

  static fromRequest(req: Request): ListSourcesRequestDto {
    return new ListSourcesRequestDto({
      notebookId: req.params.notebookId as string,
      userId: req.user!.id,
    });
  }
}

export class ListSourcesResponseDto {
  id: string;
  notebookId: string;
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
  }): ListSourcesResponseDto {
    return new ListSourcesResponseDto({
      id: entity.id,
      notebookId: entity.notebookId,
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
