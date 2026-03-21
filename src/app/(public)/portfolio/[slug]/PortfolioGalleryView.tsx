"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Lightbox, type LightboxImage } from "@/components/gallery/Lightbox";

interface ThumbImage {
  id: string;
  url: string;
  blurUrl: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  lightboxImages: LightboxImage[];
  thumbImages: ThumbImage[];
  galleryTitle: string;
}

export function PortfolioGalleryView({ lightboxImages, thumbImages }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {thumbImages.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIndex(i)}
            className="block w-full relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882]"
            aria-label={`View ${img.alt} in fullscreen`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={img.width}
              height={img.height}
              placeholder="blur"
              blurDataURL={img.blurUrl}
              className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={lightboxImages}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
