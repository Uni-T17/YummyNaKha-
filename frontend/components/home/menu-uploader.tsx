"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Camera, Check, Loader2, Plus, ScanLine, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";
import { appActions, useAppState } from "@/lib/store/app-store";

const MAX_FILE_MB = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function MenuUploader() {
  const router = useRouter();
  const { uploads } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const accepted: File[] = [];
    let rejected = 0;
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_MB * 1024 * 1024) {
        rejected++;
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) appActions.addFiles(accepted);
    setError(
      rejected
        ? `${rejected} file${rejected > 1 ? "s were" : " was"} skipped — use JPG, PNG or WebP photos under ${MAX_FILE_MB} MB.`
        : "",
    );
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
  };

  return (
    <section aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="mb-3 text-base font-black text-ink">
        Upload a Thai Menu
      </h2>
      {fileInput}

      {uploads.length === 0 ? (
        <button
          type="button"
          onClick={openPicker}
          {...dropHandlers}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed py-14 transition-colors hover:border-brand",
            dragging ? "border-brand bg-brand-tint/50" : "border-line",
          )}
        >
          <IconTile icon={Camera} size="lg" className="h-14 w-14 rounded-2xl bg-brand-tint text-brand" />
          <span className="text-center">
            <span className="block text-base font-bold text-ink">Drop your menu here</span>
            <span className="mt-0.5 block text-xs text-subtle">or tap to choose menu images</span>
          </span>
        </button>
      ) : (
        <div className="flex flex-col gap-3" {...dropHandlers}>
          <ul className="flex flex-col gap-3">
            {uploads.map((upload) => (
              <li
                key={upload.id}
                className="flex animate-fade-up items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm"
              >
                {upload.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                  <img src={upload.previewUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <IconTile icon={ScanLine} size="lg" className="bg-brand-tint text-brand" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{upload.fileName}</p>
                  {upload.status === "ready" && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-success">
                      <Check size={11} strokeWidth={3} aria-hidden />
                      Ready to analyze
                    </p>
                  )}
                  {upload.status === "uploading" && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-subtle" role="status">
                      <Loader2 size={11} strokeWidth={3} className="animate-spin" aria-hidden />
                      Uploading…
                    </p>
                  )}
                  {upload.status === "error" && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-danger" role="alert">
                      <AlertTriangle size={11} strokeWidth={3} aria-hidden />
                      {upload.error ?? "Upload failed."}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => appActions.removeUpload(upload.id)}
                  aria-label={`Remove ${upload.fileName}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-faint transition-colors hover:text-danger"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openPicker}
            className={cn(
              "flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3.5 text-sm font-bold text-muted transition-colors hover:border-brand hover:text-brand",
              dragging ? "border-brand text-brand" : "border-line",
            )}
          >
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            Add another
          </button>

          <Button
            fullWidth
            onClick={() => router.push("/analyzing")}
            className="mt-1 shadow-lg"
            disabled={!uploads.some((u) => u.status === "ready") || uploads.some((u) => u.status === "uploading")}
          >
            <Sparkles size={18} aria-hidden />
            Find My Food
          </Button>
        </div>
      )}

      <FormError className="mt-3">{error}</FormError>
    </section>
  );
}
