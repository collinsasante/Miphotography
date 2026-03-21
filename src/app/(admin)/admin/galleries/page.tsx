import { findAll, Tables } from "@/lib/airtable";
import type { AirtableClientGallery } from "@/lib/airtable";
import { getImageUrl } from "@/lib/cloudinary";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

interface Props {
  searchParams: Promise<{ status?: string; sort?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  Processing: "bg-amber-50 text-amber-700",
  Ready:      "bg-green-50 text-green-700",
  Archived:   "bg-[#F5F5F4] text-[#6B6860]",
};

const STATUSES = ["All", "Processing", "Ready", "Archived"];

export default async function AdminGalleriesPage({ searchParams }: Props) {
  const { status, sort = "desc" } = await searchParams;

  const galleries = await findAll<AirtableClientGallery>(Tables.ClientGalleries, {
    filterFormula: status ? `{status} = "${status}"` : "",
    sort: [{ field: "createdAt", direction: sort === "asc" ? "asc" : "desc" }],
  });

  const sortBase = status ? `?status=${status}&sort=` : "?sort=";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A18]">Client Galleries</h1>
          <p className="text-sm text-[#6B6860] mt-1">{galleries.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6B6860]">
            <span>Sort:</span>
            <Link href={`/admin/galleries${sortBase}desc`} className={`px-2.5 py-1.5 border transition-colors ${sort !== "asc" ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Newest</Link>
            <Link href={`/admin/galleries${sortBase}asc`}  className={`px-2.5 py-1.5 border transition-colors ${sort === "asc"  ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Oldest</Link>
          </div>
          <Link
            href="/admin/galleries/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors"
          >
            <Plus size={14} /> New Gallery
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "All"
                ? `/admin/galleries${sort !== "desc" ? `?sort=${sort}` : ""}`
                : `/admin/galleries?status=${s}${sort !== "desc" ? `&sort=${sort}` : ""}`
            }
            className={`text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors ${
              (s === "All" && !status) || s === status
                ? "border-[#C4A882] bg-[#C4A882] text-white"
                : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882]"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/admin/galleries/${gallery.id}`}
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
                <h2 className="text-sm font-medium text-[#1A1A18] group-hover:text-[#C4A882] transition-colors">
                  {gallery.title}
                </h2>
                <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 flex-shrink-0 ${STATUS_COLORS[gallery.status]}`}>
                  {gallery.status}
                </span>
              </div>
              {gallery.downloadEnabled && (
                <p className="text-xs text-green-600 mt-1">Downloads enabled</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {galleries.length === 0 && (
        <div className="text-center py-20 border border-dashed border-[#E8E4DF] text-[#6B6860] text-sm">
          No galleries found.
        </div>
      )}
    </div>
  );
}
