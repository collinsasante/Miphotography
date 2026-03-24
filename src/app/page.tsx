/**
 * Root home page — must live here (not inside a route group) to avoid a
 * duplicate-route build error with (public)/page.tsx.  We import the layout
 * components directly because this file is outside the (public) layout group.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/marketing/Hero";
import { PackageCard } from "@/components/marketing/PackageCard";
import { PhotoPreviewGrid } from "@/components/marketing/PhotoPreviewGrid";
import { getImageUrl } from "@/lib/cloudinary";
import { PORTFOLIO_PHOTOS } from "@/lib/data/portfolio";
import { PHOTO_ONLY_PACKAGES, PHOTO_VIDEO_PACKAGES } from "@/lib/data/packages";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Miphotographer | Professional Photography",
  description:
    "Premium photography services: weddings, portraits, and commercial. Book your session today.",
};

// Hero background photo
const HERO_PUBLIC_ID = "miphotography/portfolio/IMG_1606";

// Featured packages shown on home page (3 photo-only + 3 photo+video)
const FEATURED_PACKAGES = [
  PHOTO_ONLY_PACKAGES.find((p) => p.id === "amamre")!,
  PHOTO_ONLY_PACKAGES.find((p) => p.id === "awareso")!,
  PHOTO_ONLY_PACKAGES.find((p) => p.id === "grande")!,
  PHOTO_VIDEO_PACKAGES.find((p) => p.id === "miphoto")!,
  PHOTO_VIDEO_PACKAGES.find((p) => p.id === "love-is-here")!,
  PHOTO_VIDEO_PACKAGES.find((p) => p.id === "premium")!,
];

// Show 12 photos in the homepage preview grid
const PREVIEW_PHOTOS = PORTFOLIO_PHOTOS.slice(0, 12);

export default function HomePage() {
  const heroImageUrl = getImageUrl(HERO_PUBLIC_ID, { width: 1920, crop: "scale", quality: 80 });

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <Hero imageUrl={heroImageUrl} imageAlt="Miphotographer wedding photography" />

        {/* Portfolio preview */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">
                Our Work
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A18]">
                Recent Galleries
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-[#6B6860] hover:text-[#C4A882] transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <PhotoPreviewGrid photos={PREVIEW_PHOTOS.map((p) => p.publicId)} />

          <div className="mt-8 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#6B6860] hover:text-[#C4A882] transition-colors"
            >
              View all galleries <ArrowRight size={12} />
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-[#E8E4DF]" />
        </div>

        {/* Packages */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">
              Pricing
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A18]">
              Packages & Services
            </h2>
            <p className="text-[#6B6860] mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Every package includes edited, high-resolution images delivered
              via your private gallery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PACKAGES.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} featured={pkg.id === "awareso"} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#6B6860] hover:text-[#C4A882] transition-colors"
            >
              View all packages & extras <ArrowRight size={12} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center bg-[#F9F7F5]">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-4">
            Ready?
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A18] mb-6">
            Let&apos;s Create Something Beautiful
          </h2>
          <p className="text-[#6B6860] max-w-sm mx-auto mb-10 text-sm leading-relaxed">
            We&apos;d love to tell your story. Reach out to start the
            conversation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-4 bg-[#C4A882] text-white text-xs tracking-widest uppercase hover:bg-[#8B7355] transition-colors"
            >
              Book a Session
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-[#E8E4DF] text-[#1A1A18] text-xs tracking-widest uppercase hover:border-[#1A1A18] transition-colors"
            >
              Get In Touch
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
