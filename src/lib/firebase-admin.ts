/**
 * Firebase Admin SDK — server-only.
 * Lazy-initialized so it never runs during client-side rendering or at build time
 * when env vars may not be present.
 */
import type { App } from "firebase-admin/app";

let _app: App | null = null;

function getAdminApp(): App {
  if (_app) return _app;

  // Dynamic require so this module is never bundled into the client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initializeApp, getApps, cert } = require("firebase-admin/app");

  if (getApps().length) {
    _app = getApps()[0] as App;
    return _app;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  _app = initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  }) as App;

  return _app;
}

/**
 * Creates a Firebase Auth user if one doesn't already exist for the given email,
 * then generates a password-reset link and rewrites it as a "set password" invite link.
 *
 * Returns: `${APP_URL}/set-password?oobCode=<code>`
 */
export async function createInviteLink(email: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAuth } = require("firebase-admin/auth");
  const adminAuth = getAuth(getAdminApp());

  // Create user if they don't exist yet
  try {
    await adminAuth.getUserByEmail(email);
  } catch {
    // User not found — create them
    await adminAuth.createUser({ email });
  }

  const fullLink: string = await adminAuth.generatePasswordResetLink(email);
  const oobCode = new URL(fullLink).searchParams.get("oobCode");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${appUrl}/set-password?oobCode=${oobCode}`;
}

/**
 * Generates a password reset link and rewrites it to your custom reset-password page.
 *
 * Returns: `${APP_URL}/reset-password?oobCode=<code>`
 */
export async function createPasswordResetLink(email: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAuth } = require("firebase-admin/auth");
  const adminAuth = getAuth(getAdminApp());

  const fullLink: string = await adminAuth.generatePasswordResetLink(email);
  const oobCode = new URL(fullLink).searchParams.get("oobCode");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${appUrl}/reset-password?oobCode=${oobCode}`;
}
