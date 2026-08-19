import { tavily } from "@tavily/core";
import { IWebSearchService, WebSearchResponse } from "./tavily.external-service.interface.ts";

export class TavilyExternalService implements IWebSearchService {
  private static instance: TavilyExternalService | null = null;
  private readonly client;

  private constructor(apiKey: string) {
    this.client = tavily({ apiKey });
  }

  static getInstance(apiKey: string): TavilyExternalService {
    if (!TavilyExternalService.instance) {
      TavilyExternalService.instance = new TavilyExternalService(apiKey);
    }
    return TavilyExternalService.instance;
  }

  async search(query: string, options?: { maxResults?: number; topic?: "general" | "news" }): Promise<WebSearchResponse> {
    const response = await this.client.search(query, {
      maxResults: options?.maxResults ?? 5,
      topic: options?.topic ?? "general",
      includeAnswer: "basic",
    });

    return {
      query: response.query,
      answer: response.answer,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
    };
  }
}
