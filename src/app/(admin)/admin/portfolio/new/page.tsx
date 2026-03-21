import { redirect } from "next/navigation";
import { create, Tables } from "@/lib/airtable";
import type { AirtablePortfolioGallery } from "@/lib/airtable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = ["Wedding", "Portrait", "Commercial", "Family", "Events"];

async function createPortfolioGallery(formData: FormData) {
  "use server";
  const title       = (formData.get("title") as string).trim();
  const category    = formData.get("category") as string;
  const description = (formData.get("description") as string | null)?.trim() ?? "";

  // Auto-generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const gallery = await create<AirtablePortfolioGallery>(Tables.PortfolioGalleries, {
    title,
    slug,
    category,
    description,
    isPublished: false,
    sortOrder:   Date.now(),
  });

  redirect(`/admin/portfolio/${gallery.id}`);
}

export default function NewPortfolioGalleryPage() {
  return (
    <div className="max-w-lg space-y-8">
      <div>
        <Link
          href="/admin/portfolio"
          className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to portfolio
        </Link>
        <h1 className="text-2xl font-semibold text-[#1A1A18]">New Portfolio Gallery</h1>
        <p className="text-sm text-[#6B6860] mt-1">Create an album, then upload photos to it.</p>
      </div>

      <form action={createPortfolioGallery} className="space-y-5">
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6B6860] mb-1.5">
            Gallery Title *
          </label>
          <input
            name="title"
            required
            placeholder="Summer Weddings 2025"
            className="w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6B6860] mb-1.5">
            Category *
          </label>
          <select
            name="category"
            required
            className="w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] transition-colors"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6B6860] mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Optional — shown on the public gallery page"
            className="w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors"
        >
          Create Gallery
        </button>
      </form>
    </div>
  );
}
