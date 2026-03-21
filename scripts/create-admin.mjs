/**
 * One-time script: creates (or updates) the admin Firebase user with
 * email + password, then prints the UID to put in ADMIN_FIREBASE_UID.
 *
 * Usage:
 *   node scripts/create-admin.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local manually ──────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envRaw = readFileSync(envPath, "utf8");
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

// ── Admin credentials — change these ─────────────────────────────────────────
const ADMIN_EMAIL    = "admin@miphotography.com"; // change to your email
const ADMIN_PASSWORD = "Miph0t0Admin!";           // change to a strong password
// ─────────────────────────────────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const auth = getAuth();

try {
  // Try to get existing user
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    // User exists — update password
    user = await auth.updateUser(user.uid, { password: ADMIN_PASSWORD, emailVerified: true });
    console.log("✅ Updated existing user password.");
  } catch {
    // Create new user
    user = await auth.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASSWORD,
      emailVerified: true,
      displayName:   "Miphotography Admin",
    });
    console.log("✅ Created new admin user.");
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`Email   : ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`UID     : ${user.uid}`);
  console.log("─────────────────────────────────────────");
  console.log("\nAdd this to your .env.local:");
  console.log(`ADMIN_FIREBASE_UID="${user.uid}"`);
} catch (err) {
  console.error("❌ Error:", err.message);
}
