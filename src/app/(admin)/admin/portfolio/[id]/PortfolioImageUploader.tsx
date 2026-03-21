"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle } from "lucide-react";

interface Props {
  galleryId: string;
  onUploaded?: () => void;
}

export function PortfolioImageUploader({ galleryId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState({ done: 0, total: 0 });
  const [done, setDone]           = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setDone(false);
    setProgress({ done: 0, total: files.length });

    let completed = 0;
    await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("galleryId", galleryId);
        await fetch("/api/admin/portfolio/upload", { method: "POST", body: formData });
        completed++;
        setProgress({ done: completed, total: files.length });
      })
    );

    setUploading(false);
    setDone(true);
    onUploaded?.();
  }, [galleryId, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    disabled: uploading,
  });

  return (
    <div>
      <h2 className="text-sm font-medium text-[#1A1A18] mb-3">Upload Photos</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-[#C4A882] bg-[#C4A882]/5" : "border-[#E8E4DF] hover:border-[#C4A882]/50"
        } ${uploading ? "cursor-wait opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[#C4A882]" />
            <p className="text-sm text-[#6B6860]">
              Uploading {progress.done} / {progress.total}…
            </p>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <p className="text-sm text-green-700">Upload complete! Drop more files to add.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={24} className="text-[#6B6860]" />
            <p className="text-sm text-[#6B6860]">
              {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
            </p>
            <p className="text-xs text-[#6B6860]/70">JPG, PNG, WebP — multiple files supported</p>
          </div>
        )}
      </div>
    </div>
  );
}
