import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetLink } from "@/lib/firebase-admin";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Your Photographer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body as { email?: string };

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const resetLink = await createPasswordResetLink(email);

    const template = passwordResetEmail({
      resetLink,
      photographerName: ADMIN_NAME,
    });

    await sendEmail({ to: email, ...template });
  } catch (err: unknown) {
    // If the user doesn't exist in Firebase, generatePasswordResetLink throws.
    // We still return 200 to avoid revealing whether an account exists.
    const code = (err as { code?: string }).code;
    // Unexpected errors are swallowed — always return success to prevent account enumeration
    void code;
    // Fall through — always return success
  }

  return NextResponse.json({ success: true });
}
