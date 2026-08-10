import { Request } from "express";

export class GetNotebookRequestDto {
  id: string;
  userId: string;

  private constructor(props: { id: string; userId: string }) {
    this.id = props.id;
    this.userId = props.userId;
  }

  static fromRequest(req: Request): GetNotebookRequestDto {
    return new GetNotebookRequestDto({
      id: req.params.id as string,
      userId: req.user!.id,
    });
  }
}

export class GetNotebookResponseDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  aiProvider: string;
  aiModel: string;
  activeSourceCount: number;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;

  private constructor(props: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    emoji: string | null;
    aiProvider: string;
    aiModel: string;
    activeSourceCount: number;
    lastOpenedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.emoji = props.emoji;
    this.aiProvider = props.aiProvider;
    this.aiModel = props.aiModel;
    this.activeSourceCount = props.activeSourceCount;
    this.lastOpenedAt = props.lastOpenedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static toResponse(entity: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    emoji: string | null;
    aiProvider: string;
    aiModel: string;
    activeSourceCount: number;
    lastOpenedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): GetNotebookResponseDto {
    return new GetNotebookResponseDto({
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      description: entity.description,
      emoji: entity.emoji,
      aiProvider: entity.aiProvider,
      aiModel: entity.aiModel,
      activeSourceCount: entity.activeSourceCount,
      lastOpenedAt: entity.lastOpenedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    });
  }
}
