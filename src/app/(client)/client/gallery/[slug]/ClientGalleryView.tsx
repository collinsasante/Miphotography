"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Lightbox, type LightboxImage } from "@/components/gallery/Lightbox";
import { FavoriteButton } from "@/components/gallery/FavoriteButton";
import { BulkDownloadButton } from "@/components/gallery/BulkDownloadButton";
import type { AirtableClientGallery } from "@/lib/airtable";
import { Heart } from "lucide-react";

interface DisplayImage {
  id: string;
  cloudinaryId: string;
  displayUrl: string;
  downloadUrl: string;
  thumbUrl: string;
  blurUrl: string;
  alt: string;
  width: number;
  height: number;
  favorited: boolean;
}

interface BankDetails {
  bank: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  referenceNote: string;
}

interface Props {
  gallery: AirtableClientGallery;
  images: DisplayImage[];
  userId: string;
  bankDetails: BankDetails;
}

export function ClientGalleryView({ gallery, images, bankDetails }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(images.filter((i) => i.favorited).map((i) => i.id))
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleToggle = (imageId: string, favorited: boolean) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (favorited) next.add(imageId);
      else next.delete(imageId);
      return next;
    });
  };

  const lightboxImages: LightboxImage[] = images.map((img) => ({
    url:    img.displayUrl,
    alt:    img.alt,
    width:  img.width,
    height: img.height,
  }));

  const downloadUrls   = images.map((i) => i.downloadUrl);
  const allImageIds    = images.map((i) => i.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">
            {gallery.status === "Ready" ? "Your Gallery" : gallery.status}
          </p>
          <h1 className="font-serif text-3xl text-[#1A1A18]">{gallery.title}</h1>
          {gallery.description && (
            <p className="text-[#6B6860] text-sm mt-2">{gallery.description}</p>
          )}
        </div>

        {/* Download & favorites count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-[#6B6860]">
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span>{favorites.size} favorite{favorites.size !== 1 ? "s" : ""}</span>
          </div>

          {gallery.downloadEnabled && (
            <>
              {favorites.size > 0 && (
                <BulkDownloadButton
                  gallerySlug={gallery.slug}
                  galleryTitle={gallery.title}
                  imageUrls={downloadUrls}
                  favoritesOnly
                  favoriteImageIds={favorites}
                  allImageIds={allImageIds}
                />
              )}
              <BulkDownloadButton
                gallerySlug={gallery.slug}
                galleryTitle={gallery.title}
                imageUrls={downloadUrls}
              />
            </>
          )}
        </div>
      </div>

      {/* Image grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
        {images.map((img, i) => (
          <div key={img.id} className="relative group break-inside-avoid">
            <button
              onClick={() => setLightboxIndex(i)}
              className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882]"
              aria-label={`View ${img.alt} full screen`}
            >
              <Image
                src={img.thumbUrl}
                alt={img.alt}
                width={img.width}
                height={img.height}
                placeholder="blur"
                blurDataURL={img.blurUrl}
                className="w-full h-auto transition-opacity duration-300 group-hover:opacity-90"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </button>

            {/* Favorite overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <FavoriteButton
                imageId={img.id}
                galleryId={gallery.id}
                initialFavorited={favorites.has(img.id)}
                onToggle={(fav) => handleToggle(img.id, fav)}
              />
            </div>

            {/* Favorited indicator when not hovering */}
            {favorites.has(img.id) && (
              <div className="absolute top-2 right-2 group-hover:opacity-0 transition-opacity">
                <div className="p-2 bg-white/80 rounded-full">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment details (if gallery has balance due) */}
      {gallery.status === "Ready" && !gallery.downloadEnabled && (
        <div className="mt-16 p-8 border border-[#E8E4DF] bg-white">
          <h2 className="font-serif text-xl text-[#1A1A18] mb-4">Complete Your Payment</h2>
          <p className="text-[#6B6860] text-sm mb-6 leading-relaxed">
            To unlock full-resolution downloads, please complete your payment using the bank details below.
            Downloads will be enabled within 24 hours of payment confirmation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Bank",           value: bankDetails.bank },
              { label: "Account Name",   value: bankDetails.accountName },
              { label: "Account Number", value: bankDetails.accountNumber },
              { label: "Routing Number", value: bankDetails.routingNumber },
              { label: "Reference",      value: gallery.id },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col py-3 border-b border-[#E8E4DF]">
                <span className="text-[10px] tracking-widest uppercase text-[#6B6860] mb-1">{label}</span>
                <span className="text-sm font-medium text-[#1A1A18] font-mono">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6B6860] mt-6">{bankDetails.referenceNote}</p>
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={lightboxImages}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
