import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { update, Tables } from "@/lib/airtable";
import type { AirtableInquiry } from "@/lib/airtable";

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { status } = await req.json() as { status: string };
  const inquiry = await update<AirtableInquiry>(Tables.Inquiries, id, { status });
  return NextResponse.json(inquiry);
}
