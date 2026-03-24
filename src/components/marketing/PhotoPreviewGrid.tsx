"use client";

import { useState } from "react";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";

interface Props {
  photos: string[];
}

export function PhotoPreviewGrid({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {photos.map((id, i) => (
          <PhotoCard
            key={id}
            publicId={id}
            index={i}
            onClick={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))
          }
        />
      )}
    </>
  );
}
