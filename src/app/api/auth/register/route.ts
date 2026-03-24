import { NextRequest, NextResponse } from "next/server";
import { createInviteLink } from "@/lib/firebase-admin";
import { sendEmail, inviteEmail } from "@/lib/email";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Miphotographer";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json() as { email?: string; name?: string };

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const inviteLink = await createInviteLink(email);
    const template = inviteEmail({
      name: name ?? email.split("@")[0],
      inviteLink,
      photographerName: ADMIN_NAME,
    });
    await sendEmail({ to: email, ...template });
  } catch {
    // Swallow — always return success to avoid revealing if user exists
  }

  return NextResponse.json({ success: true });
}
