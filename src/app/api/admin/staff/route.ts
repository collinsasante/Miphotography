import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase-verify";
import { createInviteLink } from "@/lib/firebase-admin";
import { findAll, create, update, destroy, Tables } from "@/lib/airtable";
import { sendEmail, inviteEmail } from "@/lib/email";
import type { AirtableUser } from "@/lib/airtable";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Miphotography";
const COOKIE = "__session";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyFirebaseToken(token);
  if (!payload) return null;
  const users = await findAll<AirtableUser>(Tables.Users, {
    filterFormula: `{firebaseUid} = "${payload.uid}"`,
    maxRecords: 1,
  });
  const user = users[0];
  if (!user || user.role !== "admin") return null;
  return user;
}

/** GET /api/admin/staff — list all staff (admins) */
export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const staff = await findAll<AirtableUser>(Tables.Users, {
    filterFormula: `{role} = "admin"`,
    sort: [{ field: "createdAt", direction: "desc" }],
  });
  return NextResponse.json(staff);
}

/** POST /api/admin/staff — create a staff member and send invite */
export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email } = await req.json() as { name?: string; email?: string };
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Create Firebase user + invite link
  const inviteLink = await createInviteLink(email);

  // Upsert in Airtable as admin
  const existing = await findAll<AirtableUser>(Tables.Users, {
    filterFormula: `{email} = "${email}"`,
    maxRecords: 1,
  });

  let user: AirtableUser;
  if (existing[0]) {
    user = await update<AirtableUser>(Tables.Users, existing[0].id, { role: "admin", name: name ?? existing[0].name });
  } else {
    user = await create<AirtableUser>(Tables.Users, {
      email,
      name: name ?? "",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }

  // Send invite email
  await sendEmail({
    to: email,
    ...inviteEmail({ name: name ?? email.split("@")[0], inviteLink, photographerName: ADMIN_NAME }),
  });

  return NextResponse.json(user);
}

/** PATCH /api/admin/staff — update a staff member's role */
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, role } = await req.json() as { id?: string; role?: string };
  if (!id || !/^rec[A-Za-z0-9]{14}$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (role !== "admin" && role !== "client") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const updated = await update<AirtableUser>(Tables.Users, id, { role });
  return NextResponse.json(updated);
}

/** DELETE /api/admin/staff — remove staff member (demote to client) */
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id?: string };
  if (!id || !/^rec[A-Za-z0-9]{14}$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await update<AirtableUser>(Tables.Users, id, { role: "client" });
  return NextResponse.json({ success: true });
}
