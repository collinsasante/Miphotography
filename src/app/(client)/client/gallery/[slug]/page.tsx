import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebase-verify";
import { findOne, findAll, Tables } from "@/lib/airtable";
import type { AirtableUser, AirtableClientGallery, AirtableGalleryImage, AirtableFavorite } from "@/lib/airtable";
import { getImageUrl, getBlurDataUrl } from "@/lib/cloudinary";
import { ClientGalleryView } from "./ClientGalleryView";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Gallery — ${slug}` };
}

export default async function ClientGalleryPage({ params }: Props) {
  const { slug } = await params;

  // Get session token
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) notFound();

  const payload = await verifyFirebaseToken(token);
  if (!payload) notFound();

  const user = await findOne<AirtableUser>(
    Tables.Users,
    `{firebaseUid} = "${payload.uid}"`
  );
  if (!user) notFound();

  // Fetch gallery and verify ownership
  const gallery = await findOne<AirtableClientGallery>(
    Tables.ClientGalleries,
    `{slug} = "${slug}"`
  );
  if (!gallery) notFound();

  // Ownership check
  const ownerId = Array.isArray(gallery.userId) ? gallery.userId[0] : gallery.userId;
  if (ownerId !== user.id && user.role !== "admin") notFound();

  // Fetch images
  const images = await findAll<AirtableGalleryImage>(Tables.GalleryImages, {
    filterFormula: `{galleryId} = "${gallery.id}"`,
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  // Fetch favorites
  const favorites = await findAll<AirtableFavorite>(Tables.Favorites, {
    filterFormula: `AND({userId} = "${user.id}", {galleryId} = "${gallery.id}")`,
  });
  const favoriteImageIds = new Set(
    favorites.map((f) => (Array.isArray(f.imageId) ? f.imageId[0] : f.imageId))
  );

  // Build display images
  const displayImages = images.map((img) => ({
    id: img.id,
    cloudinaryId: img.cloudinaryId,
    displayUrl: getImageUrl(img.cloudinaryId, {
      width: 1200,
      watermark: gallery.watermarkEnabled,
    }),
    downloadUrl: getImageUrl(img.cloudinaryId, {
      width: 2400,
      quality: "auto",
      watermark: false,
    }),
    thumbUrl: getImageUrl(img.cloudinaryId, { width: 400 }),
    blurUrl:  getBlurDataUrl(img.cloudinaryId),
    alt: img.alt ?? gallery.title,
    width: img.width,
    height: img.height,
    favorited: favoriteImageIds.has(img.id),
  }));

  const bankDetails = {
    bank:          process.env.BANK_NAME ?? "",
    accountName:   process.env.BANK_ACCOUNT_NAME ?? "",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
    routingNumber: process.env.BANK_ROUTING_NUMBER ?? "",
    referenceNote: process.env.BANK_REFERENCE_NOTE ?? "Please use your gallery ID as payment reference.",
  };

  return (
    <ClientGalleryView
      gallery={gallery}
      images={displayImages}
      userId={user.id}
      bankDetails={bankDetails}
    />
  );
}
