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

  delete: (notebookId: string, id: string) =>
    request<void>(`/api/notebooks/${notebookId}/sources/${id}`, {
      method: "DELETE",
    }),
};
