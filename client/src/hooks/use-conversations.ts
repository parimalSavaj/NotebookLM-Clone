"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, Conversation } from "@/lib/api";

export const conversationKeys = {
  all: (notebookId: string) => ["conversations", notebookId] as const,
};

export function useConversations(notebookId: string) {
  return useQuery<Conversation[]>({
    queryKey: conversationKeys.all(notebookId),
    queryFn: () => chatApi.listConversations(notebookId),
    enabled: !!notebookId,
  });
}

export function useDeleteConversation(notebookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatApi.deleteConversation(notebookId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all(notebookId) });
    },
  });
}
