"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getImageUrl, getBlurDataUrl } from "@/lib/cloudinary";

interface PhotoCardProps {
  publicId: string;
  index?: number;
  /** aspect-ratio class e.g. "aspect-[4/5]" */
  aspect?: string;
  onClick?: () => void;
}

export function PhotoCard({ publicId, index = 0, aspect = "aspect-[4/5]", onClick }: PhotoCardProps) {
  const src = getImageUrl(publicId, { width: 800, quality: "auto" });
  const blur = getBlurDataUrl(publicId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      className={`relative overflow-hidden ${aspect} group ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt="Miphotographer"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        placeholder="blur"
        blurDataURL={blur}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
    </motion.div>
  );
}
