"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesApi, Source } from "@/lib/api";
import { notebookKeys } from "./use-notebooks";

export const sourceKeys = {
  all: (notebookId: string) => ["sources", notebookId] as const,
  detail: (notebookId: string, id: string) => ["sources", notebookId, id] as const,
};

export function useSources(notebookId: string) {
  return useQuery<Source[]>({
    queryKey: sourceKeys.all(notebookId),
    queryFn: () => sourcesApi.list(notebookId),
    enabled: !!notebookId,
  });
}

export function useSource(notebookId: string, id: string) {
  return useQuery<Source>({
    queryKey: sourceKeys.detail(notebookId, id),
    queryFn: () => sourcesApi.get(notebookId, id),
    enabled: !!notebookId && !!id,
  });
}

export function useCreateSource(notebookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; type: string; content?: string; metadata?: Record<string, unknown> }) =>
      sourcesApi.create(notebookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(notebookId) });
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
}

export function useUploadPdfSource(notebookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { file: File; title: string }) =>
      sourcesApi.uploadPdf(notebookId, data.file, data.title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(notebookId) });
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
}

export function useDeleteSource(notebookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcesApi.delete(notebookId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(notebookId) });
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
}
