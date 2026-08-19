"use client";

import { Notebook } from "@/lib/api";
import { useSources, useDeleteSource } from "@/hooks/use-sources";
import { useConversations, useDeleteConversation } from "@/hooks/use-conversations";
import { toast } from "@/components/ui/toast";
import { SourceItem } from "./source-item";
import { Plus, FileText, MessageSquare, Settings, ChevronRight, Trash2 } from "lucide-react";

const MAX_VISIBLE_SOURCES = 5;
const MAX_VISIBLE_CONVERSATIONS = 8;

interface NotebookSidebarProps {
  notebook: Notebook;
  notebookId: string;
  activeConversationId: string | null;
  onViewAllSources: () => void;
  onAddSource: () => void;
  onOpenSettings: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

export function NotebookSidebar({
  notebook,
  notebookId,
  activeConversationId,
  onViewAllSources,
  onAddSource,
  onOpenSettings,
  onSelectConversation,
  onNewChat,
}: NotebookSidebarProps) {
  const { data: sources = [], isLoading: sourcesLoading } = useSources(notebookId);
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations(notebookId);
  const deleteMutation = useDeleteSource(notebookId);
  const deleteConversationMutation = useDeleteConversation(notebookId);

  const visibleSources = sources.slice(0, MAX_VISIBLE_SOURCES);
  const hasMoreSources = sources.length > MAX_VISIBLE_SOURCES;
  const visibleConversations = conversations.slice(0, MAX_VISIBLE_CONVERSATIONS);

  const handleDeleteSource = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.add({ title: "Source deleted", type: "success" });
      },
      onError: (err) => {
        toast.add({
          title: err instanceof Error ? err.message : "Failed to delete source",
          type: "error",
        });
      },
    });
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversationMutation.mutate(id, {
      onSuccess: () => {
        if (activeConversationId === id) {
          onNewChat();
        }
        toast.add({ title: "Conversation deleted", type: "success" });
      },
      onError: (err) => {
        toast.add({
          title: err instanceof Error ? err.message : "Failed to delete conversation",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Sources section */}
      <div className="flex flex-col border-b border-white/20 p-3 dark:border-white/10">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[#0d2847]/50 dark:text-white/40" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0d2847]/50 dark:text-white/40">
              Sources
            </span>
            {sources.length > 0 && (
              <span className="rounded-full bg-[#0d2847]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0d2847]/60 dark:bg-white/10 dark:text-white/50">
                {sources.length}
              </span>
            )}
          </div>
          <button
            onClick={onAddSource}
            className="rounded-md p-1 text-[#0d2847]/50 transition-colors hover:bg-[#0d2847]/5 hover:text-[#0d2847] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
            title="Add source"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Sources list */}
        {sourcesLoading ? (
          <div className="space-y-1.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-[#0d2847]/5 dark:bg-white/5"
              />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <button
            onClick={onAddSource}
            className="flex items-center gap-2 rounded-lg border border-dashed border-[#0d2847]/15 px-3 py-3 text-xs text-[#0d2847]/50 transition-colors hover:border-[#0d2847]/30 hover:bg-[#0d2847]/5 dark:border-white/10 dark:text-white/40 dark:hover:border-white/20 dark:hover:bg-white/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your first source
          </button>
        ) : (
          <>
            <div className="space-y-1">
              {visibleSources.map((source) => (
                <SourceItem
                  key={source.id}
                  source={source}
                  onDelete={() => handleDeleteSource(source.id)}
                />
              ))}
            </div>

            {/* View all link */}
            {hasMoreSources && (
              <button
                onClick={onViewAllSources}
                className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#0d2847]/50 transition-colors hover:bg-[#0d2847]/5 hover:text-[#0d2847] dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
              >
                View all {sources.length} sources
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Chat history section */}
      <div className="flex flex-1 flex-col overflow-hidden border-b border-white/20 p-3 dark:border-white/10">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-[#0d2847]/50 dark:text-white/40" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0d2847]/50 dark:text-white/40">
              Chat History
            </span>
            {conversations.length > 0 && (
              <span className="rounded-full bg-[#0d2847]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0d2847]/60 dark:bg-white/10 dark:text-white/50">
                {conversations.length}
              </span>
            )}
          </div>
          <button
            onClick={onNewChat}
            className="rounded-md p-1 text-[#0d2847]/50 transition-colors hover:bg-[#0d2847]/5 hover:text-[#0d2847] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="space-y-1.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-9 animate-pulse rounded-lg bg-[#0d2847]/5 dark:bg-white/5"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-4">
              <p className="text-xs text-[#0d2847]/30 dark:text-white/20">
                No conversations yet
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {visibleConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-[#0d2847]/10 dark:bg-white/10"
                      : "hover:bg-[#0d2847]/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#0d2847] dark:text-white">
                      {conv.title || "Untitled chat"}
                    </p>
                    <p className="text-[10px] text-[#0d2847]/40 dark:text-white/30">
                      {conv.messageCount} msgs
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="rounded p-0.5 text-[#0d2847]/20 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 dark:text-white/20 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings — pinned at bottom */}
      <div className="p-3">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#0d2847]/50 transition-colors hover:bg-[#0d2847]/5 hover:text-[#0d2847]/70 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white/60"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
