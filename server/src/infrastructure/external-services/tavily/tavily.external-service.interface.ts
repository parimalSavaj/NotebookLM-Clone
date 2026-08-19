export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  answer?: string;
}

export interface IWebSearchService {
  search(query: string, options?: { maxResults?: number; topic?: "general" | "news" }): Promise<WebSearchResponse>;
}
