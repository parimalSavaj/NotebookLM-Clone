import { createOpenAI } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { IEmbeddingService } from "./embedding.external-service.interface.ts";

export class EmbeddingExternalService implements IEmbeddingService {
  private static instance: EmbeddingExternalService | null = null;
  private readonly provider;
  private readonly modelId: string;

  private constructor(apiKey: string, modelId: string) {
    this.modelId = modelId;
    this.provider = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
  }

  static getInstance(apiKey: string, modelId: string): EmbeddingExternalService {
    if (!EmbeddingExternalService.instance) {
      EmbeddingExternalService.instance = new EmbeddingExternalService(apiKey, modelId);
    }
    return EmbeddingExternalService.instance;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: this.provider.textEmbeddingModel(this.modelId),
      value: text,
    });
    return embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: this.provider.textEmbeddingModel(this.modelId),
      values: texts,
    });
    return embeddings;
  }
}
