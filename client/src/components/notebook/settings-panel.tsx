"use client";

import { useState } from "react";
import { Notebook } from "@/lib/api";
import { useUpdateNotebook } from "@/hooks/use-notebooks";
import { toast } from "@/components/ui/toast";
import { Save, Sparkles } from "lucide-react";

interface SettingsPanelProps {
  notebook: Notebook;
}

export function SettingsPanel({ notebook }: SettingsPanelProps) {
  const updateMutation = useUpdateNotebook();
  const [title, setTitle] = useState(notebook.title);
  const [description, setDescription] = useState(notebook.description || "");
  const [emoji, setEmoji] = useState(notebook.emoji || "");

  const hasChanges =
    title !== notebook.title ||
    description !== (notebook.description || "") ||
    emoji !== (notebook.emoji || "");

  const handleSave = () => {
    if (!title.trim()) return;

    updateMutation.mutate(
      {
        id: notebook.id,
        data: {
          title: title.trim(),
          description: description.trim() || null,
          emoji: emoji.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.add({ title: "Settings saved", type: "success" });
        },
        onError: (err) => {
          toast.add({
            title: err instanceof Error ? err.message : "Failed to save",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Notebook info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0d2847]/40 dark:text-white/30">
          Notebook
        </h4>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#0d2847]/60 dark:text-white/50">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#0d2847]/10 bg-white/50 px-3 py-2 text-sm text-[#0d2847] focus:border-[#0d2847]/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#0d2847]/60 dark:text-white/50">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-[#0d2847]/10 bg-white/50 px-3 py-2 text-sm text-[#0d2847] focus:border-[#0d2847]/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#0d2847]/60 dark:text-white/50">
            Emoji
          </label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-16 rounded-lg border border-[#0d2847]/10 bg-white/50 px-3 py-2 text-center text-lg text-[#0d2847] focus:border-[#0d2847]/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || !title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[#0d2847] px-3 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <Save className="h-3 w-3" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* AI Settings */}
      <div className="space-y-3 border-t border-[#0d2847]/10 pt-4 dark:border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0d2847]/40 dark:text-white/30">
          AI Model
        </h4>

        <div className="flex items-center gap-2 rounded-lg border border-[#0d2847]/10 bg-[#0d2847]/3 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
          <Sparkles className="h-4 w-4 text-[#0d2847]/50 dark:text-white/40" />
          <div>
            <p className="text-xs font-medium text-[#0d2847] dark:text-white">
              {notebook.aiModel}
            </p>
            <p className="text-xs text-[#0d2847]/50 dark:text-white/40">
              {notebook.aiProvider}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
