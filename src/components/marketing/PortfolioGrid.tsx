import { GalleryCard } from "./GalleryCard";
import type { AirtablePortfolioGallery } from "@/lib/airtable";

interface PortfolioGridProps {
  galleries: AirtablePortfolioGallery[];
}

export function PortfolioGrid({ galleries }: PortfolioGridProps) {
  if (!galleries.length) {
    return (
      <div className="text-center py-24 text-[#6B6860]">
        <p>No galleries published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {galleries.map((gallery, i) => (
        <GalleryCard
          key={gallery.id}
          title={gallery.title}
          slug={gallery.slug}
          category={gallery.category}
          coverImageUrl={gallery.coverImageUrl}
          coverPublicId={gallery.coverPublicId}
          location={gallery.location}
          index={i}
        />
      ))}
    </div>
  );
}
