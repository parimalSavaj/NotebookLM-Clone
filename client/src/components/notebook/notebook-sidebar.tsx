"use client";

import { Notebook } from "@/lib/api";
import { useSources, useDeleteSource } from "@/hooks/use-sources";
import { toast } from "@/components/ui/toast";
import { SourceItem } from "./source-item";
import { Plus, FileText, MessageSquare, Settings, ChevronRight } from "lucide-react";

const MAX_VISIBLE_SOURCES = 5;

interface NotebookSidebarProps {
  notebook: Notebook;
  notebookId: string;
  onViewAllSources: () => void;
  onAddSource: () => void;
  onOpenSettings: () => void;
}

export function NotebookSidebar({ notebook, notebookId, onViewAllSources, onAddSource, onOpenSettings }: NotebookSidebarProps) {
  const { data: sources = [], isLoading } = useSources(notebookId);
  const deleteMutation = useDeleteSource(notebookId);

  const visibleSources = sources.slice(0, MAX_VISIBLE_SOURCES);
  const hasMore = sources.length > MAX_VISIBLE_SOURCES;

  const handleDelete = (id: string) => {
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
        {isLoading ? (
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
                  onDelete={() => handleDelete(source.id)}
                />
              ))}
            </div>

            {/* View all link */}
            {hasMore && (
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
      <div className="flex flex-1 flex-col border-b border-white/20 p-3 dark:border-white/10">
        <div className="mb-2 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-[#0d2847]/50 dark:text-white/40" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0d2847]/50 dark:text-white/40">
            Chat History
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-[#0d2847]/30 dark:text-white/20">
            No conversations yet
          </p>
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
