import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { findAll, create, update, Tables } from "@/lib/airtable";
import type { AirtableSettings } from "@/lib/airtable";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await findAll<AirtableSettings>(Tables.Settings, { maxRecords: 1 });
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const settings = await create<AirtableSettings>(Tables.Settings, body);
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const settings = await update<AirtableSettings>(Tables.Settings, id, fields);
  return NextResponse.json(settings);
}
