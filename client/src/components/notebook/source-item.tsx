"use client";

import { Source } from "@/lib/api";
import { FileText, Globe, Film, File, Hash, Trash2, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface SourceItemProps {
  source: Source;
  onDelete: () => void;
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

export function SourceItem({ source, onDelete }: SourceItemProps) {
  const TypeIcon = typeIcons[source.type] || FileText;
  const status = statusConfig[source.status];
  const StatusIcon = status.icon;

  return (
    <div className="group flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#0d2847]/5 dark:hover:bg-white/5">
      {/* Type icon */}
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0d2847]/5 dark:bg-white/10">
        <TypeIcon className="h-4 w-4 text-[#0d2847]/60 dark:text-white/60" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#0d2847] dark:text-white">
          {source.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <StatusIcon className={`h-3 w-3 ${status.className}`} />
          <span className="text-xs text-[#0d2847]/50 dark:text-white/40">
            {source.status === "completed"
              ? `${source.chunkCount} chunks`
              : status.label}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="mt-1 rounded-lg p-1 text-[#0d2847]/30 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        title="Delete source"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
