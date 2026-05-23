"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, Loader2, X, ZoomIn, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Screenshot {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
  signedUrl?: string;
}

interface ScreenshotGalleryProps {
  tradeId: string;
  userId: string;
}

export function ScreenshotGallery({ tradeId, userId }: ScreenshotGalleryProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchScreenshots = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("trade_screenshots")
      .select("*")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: true });

    if (!data) return;

    // Get signed URLs for each screenshot
    const withUrls = await Promise.all(
      data.map(async (s: Screenshot) => {
        const { data: signed } = await supabase.storage
          .from("trade-screenshots")
          .createSignedUrl(s.url, 3600);
        return { ...s, signedUrl: signed?.signedUrl ?? "" };
      })
    );
    setScreenshots(withUrls);
  }, [tradeId]);

  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${tradeId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("trade-screenshots")
      .upload(path, file, { upsert: false });

    if (uploadErr) {
      alert("Upload failed: " + uploadErr.message);
      setUploading(false);
      return;
    }

    await supabase.from("trade_screenshots").insert({
      trade_id: tradeId,
      url: path,
    });

    setUploading(false);
    fetchScreenshots();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (screenshot: Screenshot) => {
    setDeleting(screenshot.id);
    const supabase = createClient();
    await supabase.storage.from("trade-screenshots").remove([screenshot.url]);
    await supabase.from("trade_screenshots").delete().eq("id", screenshot.id);
    setDeleting(null);
    fetchScreenshots();
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Screenshots</h3>
        <span className="text-xs text-[var(--muted)]">{screenshots.length} image{screenshots.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          dragging
            ? "border-brand-green bg-brand-green/10"
            : "border-[var(--card-border)] hover:border-brand-green/50 hover:bg-brand-green/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-brand-green" />
            <p className="text-sm text-[var(--muted)]">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
              <ImagePlus size={20} className="text-brand-green" />
            </div>
            <p className="text-sm font-medium">Drop images here or click to upload</p>
            <p className="text-xs text-[var(--muted)]">PNG, JPG, GIF up to 10MB each</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {screenshots.map((s) => (
            <div key={s.id} className="relative group rounded-xl overflow-hidden border border-[var(--card-border)] aspect-video bg-[var(--input)]">
              {s.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.signedUrl}
                  alt="Trade screenshot"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-[var(--muted)]" />
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => setLightbox(s.signedUrl ?? null)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  disabled={deleting === s.id}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/80 hover:bg-brand-red text-white transition-colors disabled:opacity-50"
                >
                  {deleting === s.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>
            </div>
          ))}

          {/* Add more button */}
          <button
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-[var(--card-border)] hover:border-brand-green/50 hover:bg-brand-green/5 flex items-center justify-center transition-all"
          >
            <Upload size={20} className="text-[var(--muted)]" />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Trade screenshot"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
