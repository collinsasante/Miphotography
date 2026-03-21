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
import { GalleryCard } from "@/components/marketing/GalleryCard";
import { PackageCard } from "@/components/marketing/PackageCard";
import { findAll, Tables } from "@/lib/airtable";
import type {
  AirtablePortfolioGallery,
  AirtablePackage,
  AirtableTestimonial,
} from "@/lib/airtable";
import { getImageUrl } from "@/lib/cloudinary";
import { Star, ArrowRight } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Miphotography | Professional Photography",
  description:
    "Premium photography services — weddings, portraits, and commercial. Book your session today.",
};

async function getData() {
  const [galleries, packages, testimonials] = await Promise.all([
    findAll<AirtablePortfolioGallery>(Tables.PortfolioGalleries, {
      filterFormula: "{isPublished} = 1",
      sort: [{ field: "sortOrder", direction: "asc" }],
      maxRecords: 6,
    }),
    findAll<AirtablePackage>(Tables.Packages, {
      filterFormula: "{isActive} = 1",
      sort: [{ field: "sortOrder", direction: "asc" }],
    }),
    findAll<AirtableTestimonial>(Tables.Testimonials, {
      filterFormula: "{isPublished} = 1",
      sort: [{ field: "sortOrder", direction: "asc" }],
      maxRecords: 3,
    }),
  ]);
  return { galleries, packages, testimonials };
}

export default async function HomePage() {
  const { galleries, packages, testimonials } = await getData();
  const heroGallery = galleries[0];
  const heroImageUrl = heroGallery
    ? getImageUrl(heroGallery.coverPublicId, { width: 1920, quality: 80 })
    : undefined;

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <Hero imageUrl={heroImageUrl} imageAlt="Photography hero" />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleries.map((g, i) => (
              <GalleryCard
                key={g.id}
                title={g.title}
                slug={g.slug}
                category={g.category}
                coverImageUrl={getImageUrl(g.coverPublicId, { width: 800 })}
                coverPublicId={g.coverPublicId}
                location={g.location}
                index={i}
              />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/portfolio"
              className="text-xs tracking-widest uppercase text-[#6B6860] hover:text-[#C4A882] transition-colors"
            >
              View all galleries →
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} featured={i === 1} index={i} />
            ))}
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="bg-[#1A1A18] py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">
                  Reviews
                </p>
                <h2 className="font-serif text-3xl text-white">
                  What Clients Say
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                  <div key={t.id} className="flex flex-col">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className="fill-[#C4A882] text-[#C4A882]"
                        />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed flex-1 italic">
                      &ldquo;{t.body}&rdquo;
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-white text-sm font-medium">
                        {t.clientName}
                      </p>
                      {t.clientTitle && (
                        <p className="text-[#6B6860] text-xs mt-0.5">
                          {t.clientTitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-24 px-4 text-center">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-4">
            Ready?
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A18] mb-6">
            Let&apos;s Create Something Beautiful
          </h2>
          <p className="text-[#6B6860] max-w-sm mx-auto mb-10 text-sm leading-relaxed">
            I&apos;d love to tell your story. Reach out to start the
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
