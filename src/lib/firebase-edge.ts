/**
 * Edge-compatible Firebase ID token verifier.
 * Uses JOSE (Web Crypto) — safe for middleware/Edge Runtime.
 * NO Airtable imports here.
 */
import { createRemoteJWKSet, jwtVerify } from "jose";

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
