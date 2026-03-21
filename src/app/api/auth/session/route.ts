import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase-verify";
import { findOne, create, update, Tables } from "@/lib/airtable";
import type { AirtableUser } from "@/lib/airtable";
import type { SessionUser } from "@/types";

const COOKIE_NAME = "__session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** POST /api/auth/session — set session cookie from Firebase ID token */
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  const payload = await verifyFirebaseToken(idToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Look up by Firebase UID first, then fall back to email to prevent duplicates
  let user = await findOne<AirtableUser>(
    Tables.Users,
    `{firebaseUid} = "${payload.uid}"`
  );

  if (!user && payload.email) {
    // Email already in Airtable (e.g. invited before signing up) — link the UID
    const byEmail = await findOne<AirtableUser>(
      Tables.Users,
      `{email} = "${payload.email}"`
    );
    if (byEmail) {
      user = await update<AirtableUser>(Tables.Users, byEmail.id, {
        firebaseUid: payload.uid,
        avatarUrl:   payload.picture ?? byEmail.avatarUrl ?? "",
        name:        byEmail.name || payload.name || "",
      });
    }
  }

  if (!user) {
    user = await create<AirtableUser>(Tables.Users, {
      firebaseUid:  payload.uid,
      email:        payload.email ?? "",
      name:         payload.name ?? "",
      role:         "client",
      avatarUrl:    payload.picture ?? "",
      createdAt:    new Date().toISOString(),
    });
  }

  const sessionUser: SessionUser = {
    uid:        payload.uid,
    email:      payload.email,
    name:       payload.name,
    picture:    payload.picture,
    role:       user.role,
    airtableId: user.id,
  };

  const res = NextResponse.json(sessionUser);
  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge:   COOKIE_MAX_AGE,
    path:     "/",
  };
  res.cookies.set(COOKIE_NAME, idToken, cookieOpts);
  // Role cookie lets middleware check access without hitting Airtable
  res.cookies.set("__role", user.role, cookieOpts);

  return res;
}

/** DELETE /api/auth/session — clear session cookie */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete("__role");
  return res;
}

/** GET /api/auth/session — return current session user */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null);

  const payload = await verifyFirebaseToken(token);
  if (!payload) {
    const res = NextResponse.json(null);
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  const user = await findOne<AirtableUser>(
    Tables.Users,
    `{firebaseUid} = "${payload.uid}"`
  );

  if (!user) return NextResponse.json(null);

  const sessionUser: SessionUser = {
    uid:        payload.uid,
    email:      payload.email,
    name:       user.name,
    picture:    user.avatarUrl,
    role:       user.role,
    airtableId: user.id,
  };

  return NextResponse.json(sessionUser);
}
