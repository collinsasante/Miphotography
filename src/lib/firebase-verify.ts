/**
 * Edge-compatible Firebase ID token verifier.
 * Uses JOSE (Web Crypto) to verify JWTs signed by Google.
 * Does NOT use firebase-admin (not edge-compatible).
 */
import { createRemoteJWKSet, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findOne, Tables } from "@/lib/airtable";
import type { AirtableUser } from "@/lib/airtable";

const GOOGLE_JWKS_URI =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URI));

export interface FirebaseTokenPayload {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export async function verifyFirebaseToken(
  idToken: string
): Promise<FirebaseTokenPayload | null> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID not set");

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    return {
      uid:            payload.sub as string,
      email:          payload.email as string | undefined,
      name:           payload.name as string | undefined,
      picture:        payload.picture as string | undefined,
      email_verified: payload.email_verified as boolean | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side admin guard for API routes.
 * Reads __session cookie, verifies the token, and checks role=admin in Airtable.
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
