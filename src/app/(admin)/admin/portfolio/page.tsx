import { findAll, Tables } from "@/lib/airtable";
import type { AirtablePortfolioGallery } from "@/lib/airtable";
import { getImageUrl } from "@/lib/cloudinary";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

interface Props {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

const CATEGORIES = ["All", "Wedding", "Portrait", "Commercial", "Family", "Events"];

export default async function AdminPortfolioPage({ searchParams }: Props) {
  const { category, sort = "desc" } = await searchParams;

  const allGalleries = await findAll<AirtablePortfolioGallery>(Tables.PortfolioGalleries, {
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  const galleries = category
    ? allGalleries.filter((g) => g.category === category)
    : allGalleries;

  const sortBase = category ? `?category=${category}&sort=` : "?sort=";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A18]">Portfolio</h1>
          <p className="text-sm text-[#6B6860] mt-1">{galleries.length} galleries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6B6860]">
            <span>Sort:</span>
            <Link href={`/admin/portfolio${sortBase}desc`} className={`px-2.5 py-1.5 border transition-colors ${sort !== "asc" ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Newest</Link>
            <Link href={`/admin/portfolio${sortBase}asc`}  className={`px-2.5 py-1.5 border transition-colors ${sort === "asc"  ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Oldest</Link>
          </div>
          <Link
            href="/admin/portfolio/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors"
          >
            <Plus size={14} /> New Gallery
          </Link>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={
              cat === "All"
                ? `/admin/portfolio${sort !== "desc" ? `?sort=${sort}` : ""}`
                : `/admin/portfolio?category=${cat}${sort !== "desc" ? `&sort=${sort}` : ""}`
            }
            className={`text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors ${
              (cat === "All" && !category) || cat === category
                ? "border-[#C4A882] bg-[#C4A882] text-white"
                : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882]"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/admin/portfolio/${gallery.id}`}
            className="group bg-white border border-[#E8E4DF] hover:border-[#C4A882] transition-colors overflow-hidden"
          >
            <div className="aspect-video bg-[#E8E4DF] relative overflow-hidden">
              {gallery.coverPublicId ? (
                <Image
                  src={getImageUrl(gallery.coverPublicId, { width: 400 })}
                  alt={gallery.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[#6B6860] text-xs">No cover</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-medium text-[#1A1A18] group-hover:text-[#C4A882] transition-colors">
                    {gallery.title}
                  </h2>
                  {gallery.category && (
                    <p className="text-xs text-[#6B6860] mt-0.5">{gallery.category}</p>
                  )}
                </div>
                <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 flex-shrink-0 ${
                  gallery.isPublished
                    ? "bg-green-50 text-green-700"
                    : "bg-[#F5F5F4] text-[#6B6860]"
                }`}>
                  {gallery.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {galleries.length === 0 && (
        <div className="text-center py-20 border border-dashed border-[#E8E4DF] text-[#6B6860] text-sm">
          No portfolio galleries yet. Create your first one.
        </div>
      )}
    </div>
  );
}
