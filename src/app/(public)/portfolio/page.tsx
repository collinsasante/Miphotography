"use client";

import { useState, useEffect } from "react";
import { PortfolioGrid } from "@/components/marketing/PortfolioGrid";
import { getImageUrl } from "@/lib/cloudinary";
import type { AirtablePortfolioGallery } from "@/lib/airtable";

const CATEGORIES = ["All", "Wedding", "Portrait", "Commercial", "Family", "Events"];

export default function PortfolioPage() {
  const [galleries, setGalleries] = useState<AirtablePortfolioGallery[]>([]);
  const [activeCategory, setActive] = useState("All");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setGalleries(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive filtered list inline — no effect needed
  const filteredGalleries = activeCategory === "All"
    ? galleries
    : galleries.filter((g) => g.category === activeCategory);

  const displayGalleries = filteredGalleries.map((g) => ({
    ...g,
    coverImageUrl: getImageUrl(g.coverPublicId, { width: 800 }),
  }));

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Work</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A18]">Portfolio</h1>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors ${
                activeCategory === cat
                  ? "border-[#C4A882] bg-[#C4A882] text-white"
                  : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[#E8E4DF] animate-pulse" />
            ))}
          </div>
        ) : (
          <PortfolioGrid galleries={displayGalleries} />
        )}
      </div>
    </div>
  );
}
