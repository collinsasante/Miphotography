"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl, getBlurDataUrl } from "@/lib/cloudinary";

interface LightboxProps {
  photos: string[];    // array of publicIds
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const publicId = photos[index];
  const src = getImageUrl(publicId, { width: 1600, quality: "auto", crop: "fit" });
  const blur = getBlurDataUrl(publicId);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2 transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Counter */}
      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest">
        {index + 1} / {photos.length}
      </span>

      {/* Prev */}
      {index > 0 && (
        <button
          className="absolute left-3 sm:left-6 z-10 text-white/60 hover:text-white p-3 transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[90vh] mx-12 sm:mx-20"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={publicId}
          src={src}
          alt="Miphotographer"
          fill
          sizes="(max-width: 640px) 95vw, 90vw"
          className="object-contain"
          placeholder="blur"
          blurDataURL={blur}
          priority
        />
      </div>

      {/* Next */}
      {index < photos.length - 1 && (
        <button
          className="absolute right-3 sm:right-6 z-10 text-white/60 hover:text-white p-3 transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
}
