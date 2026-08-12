"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notebooksApi, Notebook } from "@/lib/api";

export const notebookKeys = {
  all: ["notebooks"] as const,
  detail: (id: string) => ["notebooks", id] as const,
};

export function useNotebooks() {
  return useQuery<Notebook[]>({
    queryKey: notebookKeys.all,
    queryFn: notebooksApi.list,
  });
}

export function useNotebook(id: string) {
  return useQuery<Notebook>({
    queryKey: notebookKeys.detail(id),
    queryFn: () => notebooksApi.get(id),
    enabled: !!id,
  });
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description?: string; emoji?: string }) =>
      notebooksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
}

export function useUpdateNotebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string | null; emoji?: string | null } }) =>
      notebooksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notebooksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
}
