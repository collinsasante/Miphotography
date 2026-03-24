"use client";

import { useState } from "react";
import { PhotoCard } from "@/components/marketing/PhotoCard";
import { Lightbox } from "@/components/marketing/Lightbox";
import { PORTFOLIO_PHOTOS } from "@/lib/data/portfolio";

const PAGE_SIZE = 24;
const ALL_IDS = PORTFOLIO_PHOTOS.map((p) => p.publicId);

export default function PortfolioPage() {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const shown = PORTFOLIO_PHOTOS.slice(0, visible);
  const hasMore = visible < PORTFOLIO_PHOTOS.length;

  return (
    <div className="pt-24 sm:pt-36 md:pt-44 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Work</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A18]">Portfolio</h1>
          <p className="text-[#6B6860] mt-4 text-sm">{PORTFOLIO_PHOTOS.length} images</p>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {shown.map((photo, i) => (
            <PhotoCard
              key={photo.publicId}
              publicId={photo.publicId}
              index={i}
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, PORTFOLIO_PHOTOS.length))}
              className="px-8 py-4 border border-[#1A1A18] text-[#1A1A18] text-xs tracking-widest uppercase hover:bg-[#1A1A18] hover:text-white transition-colors"
            >
              Load More ({PORTFOLIO_PHOTOS.length - visible} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={ALL_IDS}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(ALL_IDS.length - 1, (i ?? 0) + 1))}
        />
      )}
    </div>
  );
}
