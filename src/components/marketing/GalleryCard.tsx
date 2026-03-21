"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getBlurDataUrl } from "@/lib/cloudinary";

interface GalleryCardProps {
  title: string;
  slug: string;
  category: string;
  coverImageUrl: string;
  coverPublicId: string;
  location?: string;
  index?: number;
}

export function GalleryCard({
  title,
  slug,
  category,
  coverImageUrl,
  coverPublicId,
  location,
  index = 0,
}: GalleryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link href={`/portfolio/${slug}`} className="group block relative overflow-hidden aspect-[4/5]">
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={getBlurDataUrl(coverPublicId)}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-1">{category}</p>
          <h3 className="font-serif text-lg text-white">{title}</h3>
          {location && <p className="text-white/60 text-xs mt-1">{location}</p>}
        </div>
      </Link>
    </motion.div>
  );
}
