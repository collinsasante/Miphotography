import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { update, destroy, Tables } from "@/lib/airtable";
import type { AirtablePackage } from "@/lib/airtable";

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const pkg = await update<AirtablePackage>(Tables.Packages, id, body);
  return NextResponse.json(pkg);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await destroy(Tables.Packages, id);
  return NextResponse.json({ ok: true });
}
