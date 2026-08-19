"use client";

import { useState, useRef, useEffect } from "react";
import { Notebook, ChatSource, WebSearchResult } from "@/lib/api";
import { useSources } from "@/hooks/use-sources";
import { useChat, ChatMessage } from "@/hooks/use-chat";
import { useConversations, useDeleteConversation } from "@/hooks/use-conversations";
import { Send, Square, Sparkles, FileText, MessageSquare, Plus, Trash2, Globe, ExternalLink } from "lucide-react";

interface ChatAreaProps {
  notebookId: string;
  notebook: Notebook;
  initialConversationId?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
}

export function ChatArea({ notebookId, notebook, initialConversationId, onConversationChange }: ChatAreaProps) {
  const { data: sources = [] } = useSources(notebookId);
  const {
    messages,
    conversationId,
    isLoading,
    isStreaming,
    sendMessage,
    stopStreaming,
    loadConversation,
    startNewConversation,
  } = useChat(notebookId);

  const { data: conversations = [], refetch: refetchConversations } = useConversations(notebookId);
  const deleteConversation = useDeleteConversation(notebookId);

  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastLoadedConvRef = useRef<string | null>(null);
  const skipNextLoadRef = useRef(false);

  const completedSources = sources.filter((s) => s.status === "completed");
  const hasSources = completedSources.length > 0;

  // Load conversation when initialConversationId changes (clicked from sidebar)
  useEffect(() => {
    // Skip if this change was triggered by our own conversationId sync
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      lastLoadedConvRef.current = initialConversationId ?? null;
      return;
    }

    if (initialConversationId && initialConversationId !== lastLoadedConvRef.current) {
      lastLoadedConvRef.current = initialConversationId;
      loadConversation(initialConversationId);
    } else if (initialConversationId === null && lastLoadedConvRef.current !== null) {
      lastLoadedConvRef.current = null;
      startNewConversation();
    }
  }, [initialConversationId, loadConversation, startNewConversation]);

  // Sync conversationId back to parent when it changes (from sending first message)
  useEffect(() => {
    // Only skip the next load if conversation was just created (went from null to a value)
    if (conversationId !== null && conversationId !== lastLoadedConvRef.current) {
      skipNextLoadRef.current = true;
      lastLoadedConvRef.current = conversationId;
    }
    onConversationChange?.(conversationId);
  }, [conversationId, onConversationChange]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refetch conversations when a conversation completes
  useEffect(() => {
    if (!isStreaming && conversationId) {
      refetchConversations();
    }
  }, [isStreaming, conversationId, refetchConversations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !hasSources || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleConversationClick = (convId: string) => {
    loadConversation(convId);
    setShowHistory(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    deleteConversation.mutate(convId);
    if (conversationId === convId) {
      startNewConversation();
    }
  };

  // Empty state — no messages yet
  if (messages.length === 0 && !showHistory) {
    return (
      <div className="flex flex-1 flex-col">
        {/* Messages area — empty state */}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          {!hasSources ? (
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
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-[#0d2847]/10 px-3 py-1.5 text-xs text-[#0d2847]/60 transition-colors hover:border-[#0d2847]/30 hover:bg-[#0d2847]/5 dark:border-white/10 dark:text-white/50 dark:hover:border-white/20 dark:hover:bg-white/5"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Conversation history button */}
              {conversations.length > 0 && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#0d2847]/50 transition-colors hover:bg-[#0d2847]/5 dark:text-white/40 dark:hover:bg-white/5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {conversations.length} previous {conversations.length === 1 ? "conversation" : "conversations"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          input={input}
          setInput={setInput}
          hasSources={hasSources}
          isStreaming={isStreaming}
          onSubmit={handleSubmit}
          onStop={stopStreaming}
        />
      </div>
    );
  }

  // Conversation history view
  if (showHistory) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0d2847] dark:text-white">
                Conversation History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-[#0d2847]/60 transition-colors hover:bg-[#0d2847]/5 dark:text-white/50 dark:hover:bg-white/5"
              >
                ← Back
              </button>
            </div>

            <button
              onClick={() => {
                startNewConversation();
                setShowHistory(false);
              }}
              className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-[#0d2847]/20 px-4 py-3 text-sm text-[#0d2847]/60 transition-colors hover:border-[#0d2847]/40 hover:bg-[#0d2847]/5 dark:border-white/20 dark:text-white/50 dark:hover:border-white/30 dark:hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              New conversation
            </button>

            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className="mb-2 flex w-full items-center justify-between rounded-xl border border-[#0d2847]/10 px-4 py-3 text-left transition-colors hover:bg-[#0d2847]/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0d2847] dark:text-white">
                    {conv.title || "Untitled conversation"}
                  </p>
                  <p className="text-xs text-[#0d2847]/40 dark:text-white/30">
                    {conv.messageCount} messages · {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="ml-2 rounded-lg p-1.5 text-[#0d2847]/30 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          hasSources={hasSources}
          isStreaming={isStreaming}
          onSubmit={handleSubmit}
          onStop={stopStreaming}
        />
      </div>
    );
  }

  // Active chat view
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Header actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[#0d2847]/40 transition-colors hover:bg-[#0d2847]/5 dark:text-white/30 dark:hover:bg-white/5"
            >
              <MessageSquare className="h-3 w-3" />
              History
            </button>
            <button
              onClick={startNewConversation}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[#0d2847]/40 transition-colors hover:bg-[#0d2847]/5 dark:text-white/30 dark:hover:bg-white/5"
            >
              <Plus className="h-3 w-3" />
              New chat
            </button>
          </div>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        input={input}
        setInput={setInput}
        hasSources={hasSources}
        isStreaming={isStreaming}
        onSubmit={handleSubmit}
        onStop={stopStreaming}
      />
    </div>
  );
}

// --- Sub-components ---

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-[#0d2847] text-white dark:bg-white/10"
            : "bg-[#0d2847]/5 text-[#0d2847] dark:bg-white/5 dark:text-white"
        }`}
      >
        {/* Web search results (shown above the response text) */}
        {!isUser && message.webSearchResults && message.webSearchResults.length > 0 && (
          <WebSearchResults searches={message.webSearchResults} />
        )}

        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
          {message.isStreaming && (
            <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-current opacity-50" />
          )}
        </div>

        {/* Source citations */}
        {!isUser && message.sourcesUsed && message.sourcesUsed.length > 0 && !message.isStreaming && (
          <SourceCitations sources={message.sourcesUsed} />
        )}
      </div>
    </div>
  );
}

function SourceCitations({ sources }: { sources: ChatSource[] }) {
  // Deduplicate by sourceId — handles both old format (per-chunk) and new format (per-source)
  const grouped = sources.reduce<Map<string, { title: string; similarity: number; chunkCount: number; content: string }>>((map, src) => {
    const key = src.sourceId;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        title: src.title || "",
        similarity: src.similarity,
        chunkCount: src.chunkCount || 1,
        content: src.content || "",
      });
    } else {
      // Keep the highest similarity and sum up chunks
      if (src.similarity > existing.similarity) {
        existing.similarity = src.similarity;
      }
      if (!src.chunkCount) {
        existing.chunkCount += 1;
      }
    }
    return map;
  }, new Map());

  const deduplicated = Array.from(grouped.entries());

  return (
    <div className="mt-2 border-t border-[#0d2847]/10 pt-2 dark:border-white/10">
      <p className="mb-1 text-xs font-medium text-[#0d2847]/40 dark:text-white/30">
        Sources used
      </p>
      <div className="flex flex-wrap gap-1">
        {deduplicated.map(([sourceId, src], i) => (
          <span
            key={sourceId}
            className="inline-block rounded-md bg-[#0d2847]/10 px-2 py-0.5 text-xs text-[#0d2847]/60 dark:bg-white/10 dark:text-white/40"
            title={src.content}
          >
            {src.title || `Source ${i + 1}`} ({Math.round(src.similarity * 100)}%{src.chunkCount > 1 ? ` · ${src.chunkCount} chunks` : ""})
          </span>
        ))}
      </div>
    </div>
  );
}

function WebSearchResults({ searches }: { searches: { query: string; results: WebSearchResult[] }[] }) {
  return (
    <div className="mb-2 space-y-2">
      {searches.map((search, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#0d2847]/10 bg-[#0d2847]/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.02]"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-[#0d2847]/40 dark:text-white/40" />
            <span className="text-xs font-medium text-[#0d2847]/50 dark:text-white/40">
              Searched: {search.query}
            </span>
          </div>
          <div className="space-y-1.5">
            {search.results.slice(0, 3).map((result, j) => (
              <a
                key={j}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#0d2847]/5 dark:hover:bg-white/5"
              >
                <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#0d2847]/30 group-hover:text-[#0d2847]/60 dark:text-white/30 dark:group-hover:text-white/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#0d2847]/70 group-hover:text-[#0d2847] dark:text-white/60 dark:group-hover:text-white">
                    {result.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-[#0d2847]/40 dark:text-white/30">
                    {result.content}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  hasSources,
  isStreaming,
  onSubmit,
  onStop,
}: {
  input: string;
  setInput: (v: string) => void;
  hasSources: boolean;
  isStreaming: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
}) {
  return (
    <div className="border-t border-white/20 px-4 py-4 dark:border-white/10">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasSources ? "Ask a question about your sources..." : "Add sources first to start chatting"}
            disabled={!hasSources}
            className="w-full rounded-xl border border-[#0d2847]/10 bg-white/60 px-4 py-3 pr-12 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
          />
        </div>
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:scale-[1.05]"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || !hasSources}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#0d2847] text-white transition-all hover:scale-[1.05] disabled:opacity-30 disabled:hover:scale-100 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
