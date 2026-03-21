import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { createInviteLink } from "@/lib/firebase-admin";
import { sendEmail, inviteEmail } from "@/lib/email";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Your Photographer";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { email, name } = body as { email?: string; name?: string };

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const inviteLink = await createInviteLink(email);

    const template = inviteEmail({
      name: name ?? email,
      inviteLink,
      photographerName: ADMIN_NAME,
    });

    await sendEmail({ to: email, ...template });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
