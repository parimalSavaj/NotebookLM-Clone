import { AiProvider } from "../enums/ai-provider.enum.ts";
import { aiConfig } from "../../shared/config/ai.config.ts";

export class NotebookEntity {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _title: string,
    private readonly _description: string | null,
    private readonly _emoji: string | null,
    private readonly _aiProvider: AiProvider,
    private readonly _aiModel: string,
    private readonly _activeSourceCount: number,
    private readonly _lastOpenedAt: Date | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
    private readonly _deletedAt: Date | null
  ) {}

  static create(props: {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    emoji?: string | null;
  }): NotebookEntity {
    const now = new Date();
    return new NotebookEntity(
      props.id,
      props.userId,
      props.title,
      props.description ?? null,
      props.emoji ?? null,
      AiProvider.OPENAI,
      aiConfig.chat.defaultModel,
      0,
      null,
      now,
      now,
      null
    );
  }

  static fromRecord(row: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    emoji: string | null;
    ai_provider: string;
    ai_model: string;
    active_source_count: number;
    last_opened_at: Date | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): NotebookEntity {
    return new NotebookEntity(
      row.id,
      row.user_id,
      row.title,
      row.description,
      row.emoji,
      row.ai_provider as AiProvider,
      row.ai_model,
      row.active_source_count,
      row.last_opened_at,
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get emoji(): string | null {
    return this._emoji;
  }

  get aiProvider(): AiProvider {
    return this._aiProvider;
  }

  get aiModel(): string {
    return this._aiModel;
  }

  get activeSourceCount(): number {
    return this._activeSourceCount;
  }

  get lastOpenedAt(): Date | null {
    return this._lastOpenedAt;
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
}
