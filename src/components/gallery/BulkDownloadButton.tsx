"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";

interface BulkDownloadButtonProps {
  gallerySlug: string;
  galleryTitle: string;
  imageUrls: string[];  // direct Cloudinary URLs (no watermark, for download)
  favoritesOnly?: boolean;
  favoriteImageIds?: Set<string>;
  allImageIds?: string[];
}

export function BulkDownloadButton({
  gallerySlug,
  galleryTitle,
  imageUrls,
  favoritesOnly = false,
  favoriteImageIds,
  allImageIds = [],
}: BulkDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const download = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Determine which URLs to download
      let urls = imageUrls;
      if (favoritesOnly && favoriteImageIds && allImageIds.length) {
        const favoriteIndices = allImageIds
          .map((id, i) => (favoriteImageIds.has(id) ? i : -1))
          .filter((i) => i !== -1);
        urls = favoriteIndices.map((i) => imageUrls[i]).filter(Boolean);
      }

      if (!urls.length) {
        alert("No images selected for download.");
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(galleryTitle) ?? zip;

      let done = 0;
      await Promise.all(
        urls.map(async (url, i) => {
          const res = await fetch(url);
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] || "jpg";
          folder.file(`${String(i + 1).padStart(3, "0")}.${ext}`, blob);
          done++;
          setProgress(Math.round((done / urls.length) * 100));
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${gallerySlug}-photos.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={download}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-60 disabled:cursor-wait"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          {progress > 0 ? `${progress}%` : "Preparing..."}
        </>
      ) : (
        <>
          <Download size={14} />
          {favoritesOnly ? "Download Favorites" : "Download All"}
        </>
      )}
    </button>
  );
}
