"use client";

import { useSession } from "@/lib/auth-client";
import { useNotebook } from "@/hooks/use-notebooks";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { NotebookSidebar } from "@/components/notebook/notebook-sidebar";
import { ChatArea } from "@/components/notebook/chat-area";
import { AllSourcesView } from "@/components/notebook/all-sources-view";
import { AddSourceDialog } from "@/components/notebook/add-source-dialog";
import { SettingsPanel } from "@/components/notebook/settings-panel";
import { ArrowLeft, PanelLeftClose, PanelLeft } from "lucide-react";

export type MainView = "chat" | "all-sources";

export default function NotebookDetailPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const notebookId = params.id as string;

  const { data: notebook, isLoading } = useNotebook(notebookId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainView, setMainView] = useState<MainView>("chat");
  const [showAddSource, setShowAddSource] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleConversationChange = useCallback((convId: string | null) => {
    setSelectedConversationId(convId);
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />
        <div className="relative z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0d2847]/20 border-t-[#0d2847] dark:border-white/20 dark:border-t-white" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />
        <div className="relative z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0d2847]/20 border-t-[#0d2847] dark:border-white/20 dark:border-t-white" />
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />
        <div className="relative z-10 text-center">
          <p className="text-lg font-medium text-[#0d2847] dark:text-white">Notebook not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-xl bg-[#0d2847] px-4 py-2 text-sm text-white dark:bg-white/10"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="relative z-20 flex w-72 flex-shrink-0 flex-col border-r border-white/20 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
          <NotebookSidebar
            notebook={notebook}
            notebookId={notebookId}
            activeConversationId={selectedConversationId}
            onViewAllSources={() => setMainView("all-sources")}
            onAddSource={() => setShowAddSource(true)}
            onOpenSettings={() => setShowSettings(true)}
            onSelectConversation={(convId) => {
              setSelectedConversationId(convId);
              setMainView("chat");
            }}
            onNewChat={() => {
              setSelectedConversationId(null);
              setMainView("chat");
            }}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-white/20 px-4 py-3 dark:border-white/10">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-1.5 text-[#0d2847]/60 transition-colors hover:bg-[#0d2847]/5 dark:text-white/50 dark:hover:bg-white/10"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-[#0d2847]/60 transition-colors hover:bg-[#0d2847]/5 dark:text-white/50 dark:hover:bg-white/10"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">{notebook.emoji || "📓"}</span>
            <h1 className="text-base font-semibold text-[#0d2847] dark:text-white">
              {notebook.title}
            </h1>
          </div>

          {/* View toggle in header when showing sources */}
          {mainView === "all-sources" && (
            <button
              onClick={() => setMainView("chat")}
              className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-[#0d2847]/60 transition-colors hover:bg-[#0d2847]/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              ← Back to Chat
            </button>
          )}
        </header>

        {/* Main view */}
        {mainView === "chat" && (
          <ChatArea
            notebookId={notebookId}
            notebook={notebook}
            initialConversationId={selectedConversationId}
            onConversationChange={handleConversationChange}
          />
        )}
        {mainView === "all-sources" && (
          <AllSourcesView
            notebookId={notebookId}
            onAddSource={() => setShowAddSource(true)}
          />
        )}
      </div>

      {/* Add source dialog — centered on main screen */}
      {showAddSource && (
        <AddSourceDialog
          notebookId={notebookId}
          onClose={() => setShowAddSource(false)}
        />
      )}

      {/* Settings dialog — centered on main screen */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d2847]/95"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0d2847] dark:text-white">
                Notebook Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1.5 text-[#0d2847]/40 transition-colors hover:bg-[#0d2847]/5 dark:text-white/40 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <SettingsPanel notebook={notebook} />
          </div>
        </div>
      )}
    </div>
  );
}
