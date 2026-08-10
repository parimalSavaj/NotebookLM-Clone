import { Request } from "express";

export class UpdateNotebookSettingsRequestDto {
  id: string;
  userId: string;
  aiProvider: string;
  aiModel: string;

  private constructor(props: {
    id: string;
    userId: string;
    aiProvider: string;
    aiModel: string;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.aiProvider = props.aiProvider;
    this.aiModel = props.aiModel;
  }

  static fromRequest(req: Request): UpdateNotebookSettingsRequestDto {
    return new UpdateNotebookSettingsRequestDto({
      id: req.params.id as string,
      userId: req.user!.id,
      aiProvider: req.body.aiProvider,
      aiModel: req.body.aiModel,
    });
  }
}

export class UpdateNotebookSettingsResponseDto {
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
  }): UpdateNotebookSettingsResponseDto {
    return new UpdateNotebookSettingsResponseDto({
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
