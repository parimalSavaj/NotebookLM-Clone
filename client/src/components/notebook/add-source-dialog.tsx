"use client";

import { useState, useRef } from "react";
import { useCreateSource, useUploadPdfSource } from "@/hooks/use-sources";
import { toast } from "@/components/ui/toast";
import { FileText, Hash, File, Globe, Film, X, Upload } from "lucide-react";

interface AddSourceDialogProps {
  notebookId: string;
  onClose: () => void;
}

type SourceTypeOption = {
  id: string;
  label: string;
  icon: typeof FileText;
  available: boolean;
  description: string;
};

const sourceTypes: SourceTypeOption[] = [
  { id: "text", label: "Text", icon: FileText, available: true, description: "Paste plain text content" },
  { id: "markdown", label: "Markdown", icon: Hash, available: true, description: "Paste markdown content" },
  { id: "pdf", label: "PDF", icon: File, available: true, description: "Upload a PDF file" },
  { id: "url", label: "Website URL", icon: Globe, available: true, description: "Scrape a webpage" },
  { id: "youtube", label: "YouTube", icon: Film, available: true, description: "Import video transcript" },
];

export function AddSourceDialog({ notebookId, onClose }: AddSourceDialogProps) {
  const createMutation = useCreateSource(notebookId);
  const uploadPdfMutation = useUploadPdfSource(notebookId);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = createMutation.isPending || uploadPdfMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedType === "pdf") {
      if (!pdfFile) return;

      uploadPdfMutation.mutate(
        {
          file: pdfFile,
          title: title.trim() || pdfFile.name.replace(/\.pdf$/i, ""),
        },
        {
          onSuccess: () => {
            toast.add({ title: "PDF uploaded successfully", type: "success" });
            onClose();
          },
          onError: (err) => {
            toast.add({
              title: err instanceof Error ? err.message : "Failed to upload PDF",
              type: "error",
            });
          },
        }
      );
      return;
    }

    if (selectedType === "url") {
      if (!url.trim()) return;

      createMutation.mutate(
        {
          title: title.trim() || new URL(url.trim()).hostname,
          type: "url",
          metadata: { url: url.trim() },
        },
        {
          onSuccess: () => {
            toast.add({ title: "Source added successfully", type: "success" });
            onClose();
          },
          onError: (err) => {
            toast.add({
              title: err instanceof Error ? err.message : "Failed to add source",
              type: "error",
            });
          },
        }
      );
      return;
    }

    if (selectedType === "youtube") {
      if (!youtubeUrl.trim()) return;

      createMutation.mutate(
        {
          title: title.trim() || "YouTube Video",
          type: "youtube",
          metadata: { url: youtubeUrl.trim() },
        },
        {
          onSuccess: () => {
            toast.add({ title: "YouTube transcript added successfully", type: "success" });
            onClose();
          },
          onError: (err) => {
            toast.add({
              title: err instanceof Error ? err.message : "Failed to fetch YouTube transcript",
              type: "error",
            });
          },
        }
      );
      return;
    }

    if (!title.trim() || !content.trim() || !selectedType) return;

    createMutation.mutate(
      {
        title: title.trim(),
        type: selectedType,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          toast.add({ title: "Source added successfully", type: "success" });
          onClose();
        },
        onError: (err) => {
          toast.add({
            title: err instanceof Error ? err.message : "Failed to add source",
            type: "error",
          });
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.pdf$/i, ""));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-4 w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d2847]/95"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0d2847] dark:text-white">
            {selectedType ? "Add Source" : "Choose Source Type"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#0d2847]/40 transition-colors hover:bg-[#0d2847]/5 dark:text-white/40 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type selection */}
        {!selectedType ? (
          <div className="grid grid-cols-2 gap-3">
            {sourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => type.available && setSelectedType(type.id)}
                disabled={!type.available}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  type.available
                    ? "border-[#0d2847]/10 hover:border-[#0d2847]/30 hover:bg-[#0d2847]/5 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5"
                    : "cursor-not-allowed border-[#0d2847]/5 opacity-40 dark:border-white/5"
                }`}
              >
                <div className={`rounded-lg p-2 ${type.available ? "bg-[#0d2847]/5 dark:bg-white/10" : "bg-[#0d2847]/3 dark:bg-white/5"}`}>
                  <type.icon className={`h-5 w-5 ${type.available ? "text-[#0d2847]/70 dark:text-white/70" : "text-[#0d2847]/30 dark:text-white/20"}`} />
                </div>
                <span className={`text-sm font-medium ${type.available ? "text-[#0d2847] dark:text-white" : "text-[#0d2847]/40 dark:text-white/30"}`}>
                  {type.label}
                </span>
                <span className="text-xs text-[#0d2847]/40 dark:text-white/30">
                  {type.description}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Content form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Back button */}
            <button
              type="button"
              onClick={() => { setSelectedType(null); setUrl(""); setYoutubeUrl(""); setPdfFile(null); }}
              className="text-xs font-medium text-[#0d2847]/50 transition-colors hover:text-[#0d2847] dark:text-white/40 dark:hover:text-white"
            >
              ← Back to types
            </button>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedType === "url"
                    ? "e.g. Blog Post Title (optional, auto-detected)"
                    : selectedType === "pdf"
                    ? "e.g. Research Paper (optional, uses filename)"
                    : selectedType === "youtube"
                    ? "e.g. Video Title (optional)"
                    : "e.g. Research Notes, Meeting Minutes..."
                }
                className="w-full rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                autoFocus={selectedType !== "url" && selectedType !== "pdf" && selectedType !== "youtube"}
                required={selectedType !== "url" && selectedType !== "pdf" && selectedType !== "youtube"}
              />
            </div>

            {selectedType === "pdf" ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  PDF File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0d2847]/15 bg-white/30 px-4 py-6 text-sm transition-colors hover:border-[#0d2847]/30 hover:bg-[#0d2847]/5 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10"
                >
                  <Upload className="h-5 w-5 text-[#0d2847]/50 dark:text-white/50" />
                  <span className="text-[#0d2847]/60 dark:text-white/50">
                    {pdfFile ? pdfFile.name : "Click to select a PDF file"}
                  </span>
                </button>
                {pdfFile && (
                  <p className="mt-1 text-xs text-[#0d2847]/40 dark:text-white/30">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Max 20MB
                  </p>
                )}
              </div>
            ) : selectedType === "url" ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                  autoFocus
                  required
                />
                <p className="mt-1 text-xs text-[#0d2847]/40 dark:text-white/30">
                  The page will be scraped and its content indexed for search
                </p>
              </div>
            ) : selectedType === "youtube" ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                  autoFocus
                  required
                />
                <p className="mt-1 text-xs text-[#0d2847]/40 dark:text-white/30">
                  The video transcript will be fetched and indexed for search
                </p>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0d2847]/70 dark:text-white/60">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={selectedType === "markdown" ? "Paste your markdown content here..." : "Paste your text content here..."}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-[#0d2847]/10 bg-white/50 px-4 py-2.5 font-mono text-sm text-[#0d2847] placeholder:text-[#0d2847]/30 focus:border-[#0d2847]/30 focus:outline-none focus:ring-2 focus:ring-[#0d2847]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                  required
                />
                <p className="mt-1 text-xs text-[#0d2847]/40 dark:text-white/30">
                  {content.length > 0 ? `${content.length.toLocaleString()} characters` : "Max 500,000 characters"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#0d2847]/70 transition-colors hover:bg-[#0d2847]/5 dark:text-white/60 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isPending ||
                  (selectedType === "pdf" ? !pdfFile :
                  selectedType === "url" ? !url.trim() :
                  selectedType === "youtube" ? !youtubeUrl.trim() :
                  (!title.trim() || !content.trim()))
                }
                className="rounded-xl bg-[#0d2847] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white/10 dark:hover:bg-white/15"
              >
                {isPending ? "Uploading..." : "Add Source"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
