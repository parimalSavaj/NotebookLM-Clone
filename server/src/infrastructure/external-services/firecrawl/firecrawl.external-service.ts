import { Firecrawl } from "firecrawl";
import { IFirecrawlService, ScrapeResult } from "./firecrawl.external-service.interface.ts";

export class FirecrawlExternalService implements IFirecrawlService {
  private static instance: FirecrawlExternalService | null = null;
  private readonly client: Firecrawl;

  private constructor(apiKey: string) {
    this.client = new Firecrawl({ apiKey });
  }

  static getInstance(apiKey: string): FirecrawlExternalService {
    if (!FirecrawlExternalService.instance) {
      FirecrawlExternalService.instance = new FirecrawlExternalService(apiKey);
    }
    return FirecrawlExternalService.instance;
  }

  async scrapeUrl(url: string): Promise<ScrapeResult> {
    try {
      const result = await this.client.scrape(url, {
        formats: ["markdown"],
      });

      // Check for HTTP error status codes from the scraped page
      const statusCode = result.metadata?.statusCode;
      if (statusCode && statusCode >= 400) {
        throw new Error(`Failed to scrape URL: page returned HTTP ${statusCode} (${result.metadata?.error || "Error"})`);
      }

      // Validate we got actual content
      if (!result.markdown || result.markdown.trim().length === 0) {
        throw new Error("Firecrawl returned empty content for the URL");
      }

      return {
        markdown: result.markdown,
        title: result.metadata?.title ?? new URL(url).hostname,
        url: result.metadata?.sourceURL ?? url,
        description: result.metadata?.description ?? undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Firecrawl request failed: ${String(error)}`);
    }
  }
}
