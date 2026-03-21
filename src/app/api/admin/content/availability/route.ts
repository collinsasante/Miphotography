import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { findAll, create, Tables } from "@/lib/airtable";
import type { AirtableAvailability } from "@/lib/airtable";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const blocks = await findAll<AirtableAvailability>(Tables.Availability, { sort: [{ field: "startDate", direction: "asc" }] });
  return NextResponse.json(blocks);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const block = await create<AirtableAvailability>(Tables.Availability, {
    startDate: body.startDate,
    endDate:   body.endDate,
    reason:    body.reason ?? "",
  });
  return NextResponse.json(block);
}
