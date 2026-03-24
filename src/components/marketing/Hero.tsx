"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  imageUrl?: string;
  imageAlt?: string;
}

export function Hero({ imageUrl, imageAlt = "Photography hero" }: HeroProps) {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_20%]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A1A18] via-[#2C2C28] to-[#0F0F0E]" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xs tracking-[0.3em] uppercase text-[#C4A882] mb-6"
        >
          Professional Photography
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-8"
        >
          Moments Crafted
          <br />
          <span className="italic text-[#C4A882]">to Last Forever</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-white/70 text-lg max-w-md mx-auto mb-12 leading-relaxed"
        >
          Premium photography for weddings, portraits, and commercial work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/booking"
            className="px-8 py-4 bg-[#C4A882] text-white text-xs tracking-widest uppercase hover:bg-[#8B7355] transition-colors"
          >
            Book a Session
          </Link>
          <Link
            href="/portfolio"
            className="px-8 py-4 border border-white/50 text-white text-xs tracking-widest uppercase hover:border-white hover:bg-white/10 transition-colors"
          >
            View Portfolio
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-white/30"
        />
      </motion.div>
    </section>
  );
}
