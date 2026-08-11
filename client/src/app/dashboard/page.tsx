"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { notebooksApi, Notebook } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  BookOpen,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createEmoji, setCreateEmoji] = useState("");
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const fetchNotebooks = useCallback(async () => {
    try {
      const data = await notebooksApi.list();
      setNotebooks(data);
    } catch {
      // silently fail on fetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotebooks();
    }
  }, [session, fetchNotebooks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setCreating(true);

    try {
      await notebooksApi.create({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        emoji: createEmoji.trim() || undefined,
      });
      setCreateTitle("");
      setCreateDescription("");
      setCreateEmoji("");
      setShowCreateModal(false);
      toast.add({ title: "Notebook created", type: "success" });
      await fetchNotebooks();
    } catch (err) {
      toast.add({
        title: err instanceof Error ? err.message : "Failed to create notebook",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notebooksApi.delete(id);
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
      toast.add({ title: "Notebook deleted", type: "success" });
    } catch (err) {
      toast.add({
        title: err instanceof Error ? err.message : "Failed to delete notebook",
        type: "error",
      });
    }
    setMenuOpen(null);
  };

  const handleRename = (notebook: Notebook) => {
    setEditingNotebook(notebook);
    setEditTitle(notebook.title);
    setEditDescription(notebook.description || "");
    setEditEmoji(notebook.emoji || "");
    setMenuOpen(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotebook || !editTitle.trim()) return;

    setEditing(true);

    try {
      await notebooksApi.update(editingNotebook.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        emoji: editEmoji.trim() || null,
      });
      setEditingNotebook(null);
      toast.add({ title: "Notebook updated", type: "success" });
      await fetchNotebooks();
    } catch (err) {
      toast.add({
        title: err instanceof Error ? err.message : "Failed to update notebook",
        type: "error",
      });
    } finally {
      setEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ff] via-[#c8e4ff] to-[#a8d4ff] dark:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#001a3a] dark:block" />

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#0d2847] dark:text-white">
            NotebookLM
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/40 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="h-7 w-7 rounded-full"
              />
            )}
            <span className="hidden text-sm font-medium text-[#0d2847] dark:text-white sm:block">
              {session.user.name}
            </span>
            <button
              onClick={handleSignOut}
              className="ml-1 rounded-lg p-1.5 text-[#0d2847]/60 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-white/50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-6 sm:px-10">
        {/* Title section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#0d2847] dark:text-white">
              My Notebooks
            </h2>
            <p className="mt-1 text-sm text-[#0d2847]/60 dark:text-white/50">
              {notebooks.length} {notebooks.length === 1 ? "notebook" : "notebooks"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0d2847] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-white/10 dark:hover:bg-white/15"
          >
            <Plus className="h-4 w-4" />
            New Notebook
          </button>
        </div>

        {/* Notebooks grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-white/20 bg-white/30 dark:border-white/5 dark:bg-white/[0.03]"
              />
            ))}
          </div>
        ) : notebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0d2847]/20 bg-white/30 py-20 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mb-4 rounded-2xl bg-[#0d2847]/5 p-4 dark:bg-white/5">
              <BookOpen className="h-8 w-8 text-[#0d2847]/40 dark:text-white/30" />
            </div>
            <p className="text-base font-medium text-[#0d2847]/70 dark:text-white/60">
              No notebooks yet
            </p>
            <p className="mt-1 text-sm text-[#0d2847]/50 dark:text-white/40">
              Create your first notebook to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#0d2847] px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] dark:bg-white/10 dark:hover:bg-white/15"
            >
              <Plus className="h-4 w-4" />
              Create Notebook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notebooks.map((notebook) => (
              <div
                key={notebook.id}
                className="group relative flex flex-col rounded-2xl border border-white/20 bg-white/50 p-5 shadow-sm backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
              >
                {/* Menu button */}
                <div className="absolute right-3 top-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === notebook.id ? null : notebook.id);
                    }}
                    className="rounded-lg p-1.5 text-[#0d2847]/40 opacity-0 transition-all hover:bg-[#0d2847]/5 group-hover:opacity-100 dark:text-white/30 dark:hover:bg-white/10"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {/* Dropdown */}
                  {menuOpen === notebook.id && (
                    <div className="absolute right-0 top-8 z-50 w-36 overflow-hidden rounded-xl border border-white/20 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d2847]/90">
                      <button
                        onClick={() => handleRename(notebook)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#0d2847] transition-colors hover:bg-[#0d2847]/5 dark:text-white dark:hover:bg-white/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(notebook.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Emoji / Icon */}
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d2847]/5 text-xl dark:bg-white/5">
                  {notebook.emoji || "📓"}
                </div>

                {/* Title */}
                <h3 className="mb-1 truncate text-base font-semibold text-[#0d2847] dark:text-white">
                  {notebook.title}
                </h3>

                {/* Description */}
                {notebook.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-[#0d2847]/60 dark:text-white/50">
                    {notebook.description}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#0d2847]/50 dark:text-white/40">
                    <Sparkles className="h-3 w-3" />
                    {notebook.aiProvider}
                  </div>
                  <span className="text-xs text-[#0d2847]/40 dark:text-white/30">
                    {notebook.activeSourceCount} {notebook.activeSourceCount === 1 ? "source" : "sources"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d2847]/95"
          >
            <h3 className="mb-4 text-lg font-semibold text-[#0d2847] dark:text-white">
              Create New Notebook
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Title
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="My Research Notes"
                  className="w-full rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Description (optional)
                </label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="What is this notebook about?"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Emoji (optional)
                </label>
                <input
                  type="text"
                  value={createEmoji}
                  onChange={(e) => setCreateEmoji(e.target.value)}
                  placeholder="📓"
                  maxLength={4}
                  className="w-20 rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-center text-lg text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#0d2847]/70 transition-colors hover:bg-[#0d2847]/5 dark:text-white/60 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createTitle.trim()}
                  className="rounded-xl bg-[#0d2847] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingNotebook && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingNotebook(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d2847]/95"
          >
            <h3 className="mb-4 text-lg font-semibold text-[#0d2847] dark:text-white">
              Edit Notebook
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="My Research Notes"
                  className="w-full rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What is this notebook about?"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Emoji
                </label>
                <input
                  type="text"
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  placeholder="📓"
                  maxLength={4}
                  className="w-20 rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-center text-lg text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNotebook(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#0d2847]/70 transition-colors hover:bg-[#0d2847]/5 dark:text-white/60 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing || !editTitle.trim()}
                  className="rounded-xl bg-[#0d2847] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  {editing ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
