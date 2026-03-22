import { NextResponse } from "next/server";
import { findAll, Tables } from "@/lib/airtable";
import type { AirtablePortfolioGallery } from "@/lib/airtable";

export async function GET() {
  const galleries = await findAll<AirtablePortfolioGallery>(Tables.PortfolioGalleries, {
    filterFormula: "{isPublished} = 1",
    sort: [{ field: "sortOrder", direction: "asc" }],
  });
  return NextResponse.json(galleries, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
  });
}
