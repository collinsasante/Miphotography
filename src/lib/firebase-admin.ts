/**
 * Firebase Admin operations via REST API.
 * Uses JOSE for service account JWT signing — fully compatible with Cloudflare Workers.
 * Does NOT import firebase-admin SDK.
 */
import { SignJWT, importPKCS8 } from "jose";

const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID   ?? "";
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY  = () => (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

/** Exchange a service-account JWT for a Google access token. */
async function getAccessToken(): Promise<string> {
  const key = await importPKCS8(PRIVATE_KEY(), "RS256");
  const now = Math.floor(Date.now() / 1000);

  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.auth https://www.googleapis.com/auth/identitytoolkit",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(CLIENT_EMAIL)
    .setSubject(CLIENT_EMAIL)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Failed to obtain Google access token");
  return data.access_token;
}

/** Create a Firebase Auth user if one doesn't exist for the given email. */
async function ensureFirebaseUser(email: string, token: string): Promise<void> {
  // Check if user exists
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: [email] }),
    }
  );
  const lookupData = await lookupRes.json() as { users?: unknown[] };
  if ((lookupData.users?.length ?? 0) > 0) return;

  // Create user
  await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email }),
    }
  );
}

/** Get an oobLink for password reset without sending an email (admin-only). */
async function getOobLink(
  email: string,
  token: string,
  requestType: "PASSWORD_RESET" | "VERIFY_EMAIL"
): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:sendOobCode`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestType, email, returnOobLink: true }),
    }
  );
  const data = await res.json() as { oobLink?: string };
  if (!data.oobLink) throw new Error("Failed to generate oob link");
  return data.oobLink;
}

/**
 * Creates a Firebase Auth user if needed, then returns a custom invite link
 * pointing to the app's set-password page.
 */
export async function createInviteLink(email: string): Promise<string> {
  const token   = await getAccessToken();
  await ensureFirebaseUser(email, token);

  const oobLink = await getOobLink(email, token, "PASSWORD_RESET");
  const oobCode = new URL(oobLink).searchParams.get("oobCode");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${appUrl}/set-password?oobCode=${oobCode}`;
}

/**
 * Returns a custom password-reset link pointing to the app's reset-password page.
 */
export async function createPasswordResetLink(email: string): Promise<string> {
  const token   = await getAccessToken();
  const oobLink = await getOobLink(email, token, "PASSWORD_RESET");
  const oobCode = new URL(oobLink).searchParams.get("oobCode");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${appUrl}/reset-password?oobCode=${oobCode}`;
}
