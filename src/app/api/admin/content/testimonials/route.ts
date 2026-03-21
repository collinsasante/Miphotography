import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { findAll, create, Tables } from "@/lib/airtable";
import type { AirtableTestimonial } from "@/lib/airtable";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const testimonials = await findAll<AirtableTestimonial>(Tables.Testimonials, { sort: [{ field: "sortOrder", direction: "asc" }] });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const t = await create<AirtableTestimonial>(Tables.Testimonials, {
    clientName:  body.clientName,
    clientTitle: body.clientTitle ?? "",
    body:        body.body,
    rating:      body.rating ?? 5,
    isPublished: body.isPublished ?? true,
    sortOrder:   body.sortOrder ?? 0,
  });
  return NextResponse.json(t);
}
