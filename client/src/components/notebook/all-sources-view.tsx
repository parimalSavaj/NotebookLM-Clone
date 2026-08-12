"use client";

import { useSources, useDeleteSource } from "@/hooks/use-sources";
import { Source } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  Plus,
  FileText,
  Hash,
  File,
  Globe,
  Film,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AllSourcesViewProps {
  notebookId: string;
  onAddSource: () => void;
}

const typeIcons: Record<Source["type"], typeof FileText> = {
  text: FileText,
  markdown: Hash,
  pdf: File,
  url: Globe,
  youtube: Film,
};

const statusConfig: Record<Source["status"], { icon: typeof CheckCircle2; className: string; label: string }> = {
  pending: { icon: Clock, className: "text-yellow-500", label: "Pending" },
  processing: { icon: Loader2, className: "text-blue-500 animate-spin", label: "Processing" },
  completed: { icon: CheckCircle2, className: "text-green-500", label: "Completed" },
  failed: { icon: AlertCircle, className: "text-red-500", label: "Failed" },
};

export function AllSourcesView({ notebookId, onAddSource }: AllSourcesViewProps) {
  const { data: sources = [], isLoading } = useSources(notebookId);
  const deleteMutation = useDeleteSource(notebookId);

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
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0d2847] dark:text-white">
            All Sources
          </h2>
          <p className="mt-0.5 text-sm text-[#0d2847]/50 dark:text-white/40">
            {sources.length} {sources.length === 1 ? "source" : "sources"} in this notebook
          </p>
        </div>
        <button
          onClick={onAddSource}
          className="flex items-center gap-2 rounded-xl bg-[#0d2847] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-white/10 dark:hover:bg-white/15"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </button>
      </div>

      {/* Sources grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-[#0d2847]/5 dark:bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => {
            const TypeIcon = typeIcons[source.type] || FileText;
            const status = statusConfig[source.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={source.id}
                className="group relative flex items-start gap-3 rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
              >
                {/* Type icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0d2847]/5 dark:bg-white/10">
                  <TypeIcon className="h-5 w-5 text-[#0d2847]/60 dark:text-white/60" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0d2847] dark:text-white">
                    {source.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <StatusIcon className={`h-3 w-3 ${status.className}`} />
                    <span className="text-xs text-[#0d2847]/50 dark:text-white/40">
                      {source.status === "completed"
                        ? `${source.chunkCount} chunks · ${source.charCount.toLocaleString()} chars`
                        : status.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#0d2847]/30 dark:text-white/20">
                    {source.type} · {new Date(source.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(source.id)}
                  className="absolute right-2 top-2 rounded-lg p-1.5 text-[#0d2847]/20 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:text-white/15 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  title="Delete source"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
