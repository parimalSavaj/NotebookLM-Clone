const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ApiResponse<T> {
  statusCode: number;
  data: T;
}

interface ApiError {
  statusCode: number;
  message: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: "Something went wrong",
    }));
    throw new Error(error.message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export interface Notebook {
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
}

export interface Source {
  id: string;
  notebookId: string;
  title: string;
  type: "pdf" | "text" | "markdown" | "url" | "youtube";
  status: "pending" | "processing" | "completed" | "failed";
  metadata: Record<string, unknown>;
  fileSize: number | null;
  chunkCount: number;
  charCount: number;
  errorMessage: string | null;
  content?: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const notebooksApi = {
  list: () => request<Notebook[]>("/api/notebooks"),

  get: (id: string) => request<Notebook>(`/api/notebooks/${id}`),

  create: (data: { title: string; description?: string; emoji?: string }) =>
    request<Notebook>("/api/notebooks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { title?: string; description?: string | null; emoji?: string | null }) =>
    request<Notebook>(`/api/notebooks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateSettings: (id: string, data: { aiProvider: string; aiModel: string }) =>
    request<Notebook>(`/api/notebooks/${id}/settings`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/notebooks/${id}`, {
      method: "DELETE",
    }),
};

export const sourcesApi = {
  list: (notebookId: string) =>
    request<Source[]>(`/api/notebooks/${notebookId}/sources`),

  get: (notebookId: string, id: string) =>
    request<Source>(`/api/notebooks/${notebookId}/sources/${id}`),

  create: (notebookId: string, data: { title: string; type: string; content?: string; metadata?: Record<string, unknown> }) =>
    request<Source>(`/api/notebooks/${notebookId}/sources`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  uploadPdf: async (notebookId: string, file: File, title: string): Promise<Source> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", "pdf");
    formData.append("metadata", JSON.stringify({}));

    const res = await fetch(`${API_URL}/api/notebooks/${notebookId}/sources/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: "Failed to upload PDF",
      }));
      throw new Error(error.message);
    }

    const json: ApiResponse<Source> = await res.json();
    return json.data;
  },

  delete: (notebookId: string, id: string) =>
    request<void>(`/api/notebooks/${notebookId}/sources/${id}`, {
      method: "DELETE",
    }),
};

// Chat types
export interface Conversation {
  id: string;
  title: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourcesUsed: { sourceId: string; chunkId: string; similarity: number }[] | null;
  createdAt: string;
}

export interface ChatSource {
  sourceId: string;
  title: string;
  similarity: number;
  chunkCount: number;
  content: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

export const chatApi = {
  listConversations: (notebookId: string) =>
    request<Conversation[]>(`/api/notebooks/${notebookId}/conversations`),

  getMessages: (notebookId: string, conversationId: string, params?: { limit?: number; before?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.before) query.set("before", params.before);
    const qs = query.toString();
    return request<{ messages: Message[]; hasMore: boolean }>(
      `/api/notebooks/${notebookId}/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`
    );
  },

  deleteConversation: (notebookId: string, conversationId: string) =>
    request<void>(`/api/notebooks/${notebookId}/conversations/${conversationId}`, {
      method: "DELETE",
    }),

  /**
   * Send a chat message and consume the SSE stream.
   * Returns an abort function.
   */
  sendMessage: (
    notebookId: string,
    data: { conversationId: string | null; message: string },
    callbacks: {
      onMetadata?: (meta: { conversationId: string; messageId: string }) => void;
      onChunk?: (text: string) => void;
      onSources?: (sources: ChatSource[]) => void;
      onWebSearch?: (results: { query: string; results: WebSearchResult[] }) => void;
      onDone?: (result: { totalTokens: number }) => void;
      onError?: (error: string) => void;
    }
  ): { abort: () => void } => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/notebooks/${notebookId}/chat`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: "Chat request failed" }));
          callbacks.onError?.(error.message);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          callbacks.onError?.("No response stream");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ")) {
              const jsonData = line.slice(6);
              try {
                const parsed = JSON.parse(jsonData);
                switch (currentEvent) {
                  case "metadata":
                    callbacks.onMetadata?.(parsed);
                    break;
                  case "chunk":
                    callbacks.onChunk?.(parsed.text);
                    break;
                  case "sources":
                    callbacks.onSources?.(parsed);
                    break;
                  case "web_search":
                    callbacks.onWebSearch?.(parsed);
                    break;
                  case "done":
                    callbacks.onDone?.(parsed);
                    break;
                  case "error":
                    callbacks.onError?.(parsed.message);
                    break;
                }
              } catch {
                // Skip malformed JSON
              }
              currentEvent = "";
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          callbacks.onError?.((error as Error).message);
        }
      }
    })();

    return { abort: () => controller.abort() };
  },
};
