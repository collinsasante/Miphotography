import { findAll, create, Tables } from "@/lib/airtable";
import type { AirtableUser, AirtableClientGallery } from "@/lib/airtable";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function createGallery(formData: FormData) {
  "use server";
  const title    = (formData.get("title") as string).trim();
  const clientId = formData.get("clientId") as string;
  const desc     = (formData.get("description") as string | null)?.trim() ?? "";

  if (!title || !clientId) return;

  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const gallery = await create<AirtableClientGallery>(Tables.ClientGalleries, {
    title,
    slug: `${slug}-${Date.now()}`,
    description: desc,
    userId: [clientId],
    status: "Processing",
    downloadEnabled: false,
    watermarkEnabled: false,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/admin/galleries");
  redirect(`/admin/galleries/${gallery.id}`);
}

export default async function NewGalleryPage() {
  const clients = await findAll<AirtableUser>(Tables.Users, {
    filterFormula: '{role} = "client"',
    sort: [{ field: "name", direction: "asc" }],
  });

  const inputClass = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] transition-colors";
  const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-1.5";

  return (
    <div className="max-w-lg">
      <Link href="/admin/galleries" className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors mb-6">
        <ArrowLeft size={14} /> Back to galleries
      </Link>

      <h1 className="text-2xl font-semibold text-[#1A1A18] mb-8">New Gallery</h1>

      <form action={createGallery} className="space-y-5">
        <div>
          <label className={labelClass}>Gallery Title *</label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Sarah & James Wedding"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Client *</label>
          {clients.length === 0 ? (
            <p className="text-sm text-[#6B6860]">No clients yet. <Link href="/admin/clients" className="text-[#C4A882] underline">View clients</Link></p>
          ) : (
            <select name="clientId" required className={inputClass}>
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.email} {c.name ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Optional notes about this session…"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors"
          >
            Create Gallery
          </button>
        </div>
      </form>
    </div>
  );
}
