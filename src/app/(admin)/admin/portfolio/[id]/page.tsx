import { notFound } from "next/navigation";
import { findById, findAll, Tables } from "@/lib/airtable";
import type { AirtablePortfolioGallery, AirtablePortfolioImage } from "@/lib/airtable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortfolioGalleryManager } from "./PortfolioGalleryManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPortfolioGalleryPage({ params }: Props) {
  const { id } = await params;

  const gallery = await findById<AirtablePortfolioGallery>(Tables.PortfolioGalleries, id);
  if (!gallery) notFound();

  const images = await findAll<AirtablePortfolioImage>(Tables.PortfolioImages, {
    filterFormula: `FIND("${id}", ARRAYJOIN({galleryId})) > 0`,
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/portfolio"
          className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to portfolio
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A18]">{gallery.title}</h1>
            {gallery.category && (
              <p className="text-sm text-[#6B6860] mt-1">{gallery.category}</p>
            )}
          </div>
          <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 ${
            gallery.isPublished ? "bg-green-50 text-green-700" : "bg-[#F5F5F4] text-[#6B6860]"
          }`}>
            {gallery.isPublished ? "Published" : "Draft"}
          </span>
        </div>
        {gallery.description && (
          <p className="text-sm text-[#6B6860] mt-3 max-w-2xl">{gallery.description}</p>
        )}
      </div>

      <PortfolioGalleryManager gallery={gallery} images={images} />
    </div>
  );
}
