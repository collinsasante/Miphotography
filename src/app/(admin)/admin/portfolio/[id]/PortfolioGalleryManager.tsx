"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/cloudinary";
import { PortfolioImageUploader } from "./PortfolioImageUploader";
import type { AirtablePortfolioGallery, AirtablePortfolioImage } from "@/lib/airtable";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  gallery: AirtablePortfolioGallery;
  images:  AirtablePortfolioImage[];
}

export function PortfolioGalleryManager({ gallery, images: initialImages }: Props) {
  const router   = useRouter();
  const [images, setImages]       = useState(initialImages);
  const [published, setPublished] = useState(gallery.isPublished);
  const [cover, setCover]         = useState(gallery.coverPublicId ?? "");
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const refreshImages = async () => {
    const res = await fetch(`/api/admin/portfolio/images?galleryId=${gallery.id}`);
    if (res.ok) {
      const data = await res.json();
      setImages(data);
    }
  };

  const togglePublished = async () => {
    setSaving(true);
    const next = !published;
    await fetch(`/api/admin/portfolio/galleries/${gallery.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isPublished: next }),
    });
    setPublished(next);
    setSaving(false);
  };

  const setCoverImage = async (publicId: string) => {
    await fetch(`/api/admin/portfolio/galleries/${gallery.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ coverPublicId: publicId }),
    });
    setCover(publicId);
  };

  const deleteGallery = async () => {
    if (!confirm("Delete this gallery and all its photos? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/portfolio/galleries/${gallery.id}`, { method: "DELETE" });
    router.push("/admin/portfolio");
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white border border-[#E8E4DF] p-5 flex flex-wrap items-center gap-4">
        <button
          onClick={togglePublished}
          disabled={saving}
          className={`flex items-center gap-2 text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors disabled:opacity-50 ${
            published
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882]"
          }`}
        >
          {published ? <Eye size={13} /> : <EyeOff size={13} />}
          {published ? "Published — click to unpublish" : "Draft — click to publish"}
        </button>

        <button
          onClick={deleteGallery}
          disabled={deleting}
          className="flex items-center gap-2 text-[10px] tracking-widest uppercase px-3 py-2 border border-[#E8E4DF] text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors ml-auto disabled:opacity-50"
        >
          <Trash2 size={13} />
          Delete Gallery
        </button>
      </div>

      {/* Published status note */}
      {published ? (
        <p className="text-xs text-green-700 bg-green-50 border border-green-100 px-4 py-2">
          This gallery is live on the public portfolio page.
        </p>
      ) : (
        <p className="text-xs text-[#6B6860] bg-[#FAFAF9] border border-[#E8E4DF] px-4 py-2">
          This gallery is a draft — not visible on the public site. Publish it when ready.
        </p>
      )}

      {/* Uploader */}
      <PortfolioImageUploader galleryId={gallery.id} onUploaded={refreshImages} />

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-[#6B6860] mb-3">
            Photos ({images.length}) — click the star to set as cover
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {images.map((img) => {
              const isCover = img.cloudinaryId === cover;
              return (
                <div key={img.id} className="relative aspect-square bg-[#E8E4DF] overflow-hidden group">
                  <Image
                    src={getImageUrl(img.cloudinaryId, { width: 200 })}
                    alt={img.alt ?? "Portfolio photo"}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-1 left-1 bg-[#C4A882] text-white text-[9px] px-1.5 py-0.5 tracking-widest uppercase">
                      Cover
                    </div>
                  )}
                  {/* Set cover button */}
                  <button
                    onClick={() => setCoverImage(img.cloudinaryId)}
                    title="Set as cover"
                    className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${
                      isCover
                        ? "bg-[#C4A882] text-white"
                        : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Star size={11} fill={isCover ? "currentColor" : "none"} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[#E8E4DF] text-sm text-[#6B6860]">
          No photos yet. Upload some above.
        </div>
      )}
    </div>
  );
}
