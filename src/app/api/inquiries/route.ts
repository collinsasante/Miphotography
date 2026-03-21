import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validations/inquiry";
import { create, Tables } from "@/lib/airtable";
import { sendEmail, inquiryNotificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body._trap) return NextResponse.json({ success: true });

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const data = parsed.data;
  await create(Tables.Inquiries, {
    name: data.name, email: data.email, subject: data.subject ?? "",
    message: data.message, type: data.type, status: "New", createdAt: new Date().toISOString(),
  });
  await sendEmail(inquiryNotificationEmail({ name: data.name, email: data.email, type: data.type, message: data.message }));
  return NextResponse.json({ success: true });
}
