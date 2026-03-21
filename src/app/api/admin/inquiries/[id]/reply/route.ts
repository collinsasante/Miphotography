import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { findById, update, Tables } from "@/lib/airtable";
import { sendEmail, inquiryReplyEmail } from "@/lib/email";
import type { AirtableInquiry } from "@/lib/airtable";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Miphotography";

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { replyText, subject } = await req.json() as { replyText: string; subject?: string };

  if (!replyText?.trim()) {
    return NextResponse.json({ error: "replyText is required" }, { status: 400 });
  }

  const inquiry = await findById<AirtableInquiry>(Tables.Inquiries, id);
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = inquiryReplyEmail({
    clientName:       inquiry.name,
    subject:          subject ?? inquiry.subject ?? "Your inquiry",
    replyText,
    photographerName: ADMIN_NAME,
  });

  await sendEmail({ to: inquiry.email, ...template });
  await update(Tables.Inquiries, id, { status: "Replied" });

  return NextResponse.json({ ok: true });
}
