import { notFound } from "next/navigation";
import { findById, findAll, update, Tables } from "@/lib/airtable";
import type { AirtableClientGallery, AirtableGalleryImage, AirtableUser } from "@/lib/airtable";
import { getImageUrl, getBlurDataUrl } from "@/lib/cloudinary";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";
import { GalleryImageUploader } from "./GalleryImageUploader";
import { sendEmail, galleryReadyEmail } from "@/lib/email";

interface Props {
  params: Promise<{ id: string }>;
}

async function setGalleryStatus(formData: FormData) {
  "use server";
  const id     = formData.get("id") as string;
  const status = formData.get("status") as string;
  const notify = formData.get("notify") === "true";

  const gallery = await findById<AirtableClientGallery>(Tables.ClientGalleries, id);
  if (!gallery) return;

  await update(Tables.ClientGalleries, id, { status });

  if (notify && status === "Ready") {
    const userId = Array.isArray(gallery.userId) ? gallery.userId[0] : gallery.userId;
    const user = await findById<AirtableUser>(Tables.Users, userId);
    if (user?.email) {
      const tpl = galleryReadyEmail({
        clientName:   user.name ?? user.email,
        galleryTitle: gallery.title,
        gallerySlug:  gallery.slug,
      });
      await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
    }
  }

  revalidatePath(`/admin/galleries/${id}`);
}

async function toggleDownload(formData: FormData) {
  "use server";
  const id      = formData.get("id") as string;
  const enabled = formData.get("enabled") === "true";
  await update(Tables.ClientGalleries, id, { downloadEnabled: enabled });
  revalidatePath(`/admin/galleries/${id}`);
}

export default async function AdminGalleryDetailPage({ params }: Props) {
  const { id } = await params;

  const gallery = await findById<AirtableClientGallery>(Tables.ClientGalleries, id);
  if (!gallery) notFound();

  const images = await findAll<AirtableGalleryImage>(Tables.GalleryImages, {
    filterFormula: `{galleryId} = "${gallery.id}"`,
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  const userId = Array.isArray(gallery.userId) ? gallery.userId[0] : gallery.userId;
  const client = userId ? await findById<AirtableUser>(Tables.Users, userId) : null;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/galleries" className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to galleries
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A18]">{gallery.title}</h1>
            {client && <p className="text-sm text-[#6B6860] mt-1">Client: {client.name ?? client.email}</p>}
          </div>
          <span className={`text-sm font-medium ${
            gallery.status === "Ready" ? "text-green-700" : gallery.status === "Processing" ? "text-amber-700" : "text-[#6B6860]"
          }`}>
            {gallery.status}
          </span>
        </div>
      </div>

      {/* Status controls */}
      <div className="bg-white border border-[#E8E4DF] p-5 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {["Processing", "Ready", "Archived"].map((s) => (
            <form key={s} action={setGalleryStatus}>
              <input type="hidden" name="id" value={gallery.id} />
              <input type="hidden" name="status" value={s} />
              <input type="hidden" name="notify" value={s === "Ready" ? "true" : "false"} />
              <button
                type="submit"
                disabled={gallery.status === s}
                className={`text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors disabled:opacity-40 disabled:cursor-default ${
                  gallery.status === s
                    ? "border-[#C4A882] bg-[#C4A882] text-white"
                    : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882]"
                }`}
              >
                {s === "Ready" ? "Mark Ready + Notify Client" : `Set ${s}`}
              </button>
            </form>
          ))}
        </div>

        <form action={toggleDownload} className="ml-auto">
          <input type="hidden" name="id" value={gallery.id} />
          <input type="hidden" name="enabled" value={String(!gallery.downloadEnabled)} />
          <button
            type="submit"
            className={`text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors ${
              gallery.downloadEnabled
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882]"
            }`}
          >
            {gallery.downloadEnabled ? "Downloads: ON" : "Enable Downloads"}
          </button>
        </form>
      </div>

      {/* Image uploader */}
      <GalleryImageUploader galleryId={gallery.id} />

      {/* Image grid */}
      <div>
        <h2 className="text-sm font-medium text-[#1A1A18] mb-4">
          Images ({images.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square bg-[#E8E4DF] overflow-hidden">
              <Image
                src={getImageUrl(img.cloudinaryId, { width: 200 })}
                alt={img.alt ?? "Gallery image"}
                fill
                className="object-cover"
                sizes="150px"
                placeholder="blur"
                blurDataURL={getBlurDataUrl(img.cloudinaryId)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
