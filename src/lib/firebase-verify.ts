/**
 * Server-side (Node.js runtime) Firebase helpers.
 * Imports Airtable — do NOT import this from middleware.
 */
import { cookies } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebase-edge";
import { findOne, Tables } from "@/lib/airtable";
import type { AirtableUser } from "@/lib/airtable";

export type { FirebaseTokenPayload } from "@/lib/firebase-edge";
export { verifyFirebaseToken } from "@/lib/firebase-edge";

/**
 * Admin guard for API routes.
 * Reads __session cookie, verifies token, checks role=admin in Airtable.
 * Returns the AirtableUser if admin, null otherwise.
 */
export async function requireAdmin(): Promise<AirtableUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) return null;

  const payload = await verifyFirebaseToken(token);
  if (!payload) return null;

  const user = await findOne<AirtableUser>(
    Tables.Users,
    `{firebaseUid} = "${payload.uid}"`
  );

  return user?.role === "admin" ? user : null;
}
