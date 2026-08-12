"use client";

import { useState } from "react";
import { Notebook } from "@/lib/api";
import { useSources } from "@/hooks/use-sources";
import { Send, Sparkles, FileText } from "lucide-react";

interface ChatAreaProps {
  notebookId: string;
  notebook: Notebook;
}

export function ChatArea({ notebookId, notebook }: ChatAreaProps) {
  const { data: sources = [] } = useSources(notebookId);
  const [message, setMessage] = useState("");

  const completedSources = sources.filter((s) => s.status === "completed");
  const hasSources = completedSources.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !hasSources) return;

    // Chat API not built yet — placeholder
    setMessage("");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {!hasSources ? (
          /* Empty state — no sources */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d2847]/5 dark:bg-white/5">
              <FileText className="h-7 w-7 text-[#0d2847]/30 dark:text-white/30" />
            </div>
            <h3 className="text-base font-semibold text-[#0d2847] dark:text-white">
              Add sources to get started
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#0d2847]/50 dark:text-white/40">
              Add text, documents, or links to your notebook. Once processed, you can ask questions about your sources.
            </p>
          </div>
        ) : (
          /* Ready state — has sources */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d2847]/5 dark:bg-white/5">
              <Sparkles className="h-7 w-7 text-[#0d2847]/30 dark:text-white/30" />
            </div>
            <h3 className="text-base font-semibold text-[#0d2847] dark:text-white">
              Ask anything about your sources
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#0d2847]/50 dark:text-white/40">
              {completedSources.length} {completedSources.length === 1 ? "source" : "sources"} ready.
              Ask questions and get answers grounded in your content.
            </p>

            {/* Suggested prompts */}
            <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
              {["Summarize the key points", "What are the main themes?", "List important details"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="rounded-full border border-[#0d2847]/10 px-3 py-1.5 text-xs text-[#0d2847]/60 transition-colors hover:border-[#0d2847]/30 hover:bg-[#0d2847]/5 dark:border-white/10 dark:text-white/50 dark:hover:border-white/20 dark:hover:bg-white/5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/20 px-4 py-4 dark:border-white/10">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={hasSources ? "Ask a question about your sources..." : "Add sources first to start chatting"}
              disabled={!hasSources}
              className="w-full rounded-xl border border-[#0d2847]/10 bg-white/60 px-4 py-3 pr-12 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || !hasSources}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#0d2847] text-white transition-all hover:scale-[1.05] disabled:opacity-30 disabled:hover:scale-100 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
