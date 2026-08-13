export interface ScrapeResult {
  markdown: string;
  title: string;
  url: string;
  description?: string;
}

export interface IFirecrawlService {
  scrapeUrl(url: string): Promise<ScrapeResult>;
}
