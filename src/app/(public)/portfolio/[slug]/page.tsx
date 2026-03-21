import { notFound } from "next/navigation";
import { Metadata } from "next";
import { findOne, findAll, Tables } from "@/lib/airtable";
import type { AirtablePortfolioGallery, AirtablePortfolioImage } from "@/lib/airtable";
import { getImageUrl, getBlurDataUrl } from "@/lib/cloudinary";
import { PortfolioGalleryView } from "./PortfolioGalleryView";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  const gallery = await findOne<AirtablePortfolioGallery>(
    Tables.PortfolioGalleries,
    `AND({slug} = "${slug}", {isPublished} = 1)`
  );
  if (!gallery) return null;

  const images = await findAll<AirtablePortfolioImage>(Tables.PortfolioImages, {
    filterFormula: `{galleryId} = "${gallery.id}"`,
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  return { gallery, images };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return {};
  const { gallery } = data;
  return {
    title: gallery.title,
    description: gallery.description,
    openGraph: {
      images: [{ url: getImageUrl(gallery.coverPublicId, { width: 1200 }) }],
    },
  };
}

export default async function PortfolioGalleryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

  const { gallery, images } = data;
  const lightboxImages = images.map((img) => ({
    url: getImageUrl(img.cloudinaryId, { width: 1600 }),
    alt: img.alt ?? gallery.title,
    width: img.width,
    height: img.height,
  }));

  const thumbImages = images.map((img) => ({
    id: img.id,
    url: getImageUrl(img.cloudinaryId, { width: 800 }),
    blurUrl: getBlurDataUrl(img.cloudinaryId),
    alt: img.alt ?? gallery.title,
    width: img.width,
    height: img.height,
  }));

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">{gallery.category}</p>
          <h1 className="font-serif text-4xl text-[#1A1A18]">{gallery.title}</h1>
          {gallery.location && (
            <p className="text-[#6B6860] mt-2 text-sm">{gallery.location}</p>
          )}
          {gallery.description && (
            <p className="text-[#6B6860] mt-4 max-w-2xl leading-relaxed">{gallery.description}</p>
          )}
        </div>

        <PortfolioGalleryView
          lightboxImages={lightboxImages}
          thumbImages={thumbImages}
          galleryTitle={gallery.title}
        />
      </div>
    </div>
  );
}
