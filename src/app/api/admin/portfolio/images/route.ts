import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { findAll, Tables } from "@/lib/airtable";
import type { AirtablePortfolioImage } from "@/lib/airtable";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const galleryId = req.nextUrl.searchParams.get("galleryId");
  if (!galleryId) return NextResponse.json({ error: "Missing galleryId" }, { status: 400 });

  // Validate Airtable record ID format to prevent formula injection
  if (!/^rec[A-Za-z0-9]{14}$/.test(galleryId)) {
    return NextResponse.json({ error: "Invalid galleryId" }, { status: 400 });
  }

  const images = await findAll<AirtablePortfolioImage>(Tables.PortfolioImages, {
    filterFormula: `FIND("${galleryId}", ARRAYJOIN({galleryId})) > 0`,
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  return NextResponse.json(images);
}
