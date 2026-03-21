/**
 * Cleans up duplicate/fake user records in Airtable and Firebase.
 * Run once: node scripts/cleanup-users.mjs
 */
import Airtable from "airtable";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
for (const line of envRaw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const auth  = getAuth();
const base  = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base("Users");

// 1. Delete fake admin@miphotography.com from Firebase
try {
  const u = await auth.getUserByEmail("admin@miphotography.com");
  await auth.deleteUser(u.uid);
  console.log("✅ Deleted Firebase user: admin@miphotography.com");
} catch {
  console.log("ℹ️  admin@miphotography.com not found in Firebase (already gone)");
}

// 2. Load all Airtable user records
const records = await table.select().all();
console.log(`\nFound ${records.length} Airtable user records:`);
records.forEach(r => {
  console.log(`  [${r.id}] ${r.fields.email || "(no email)"} | uid: ${r.fields.firebaseUid || "(none)"} | role: ${r.fields.role}`);
});

// 3. Delete records for admin@miphotography.com
const fakeAdmins = records.filter(r => r.fields.email === "admin@miphotography.com");
for (const r of fakeAdmins) {
  await table.destroy(r.id);
  console.log(`\n✅ Deleted Airtable record for admin@miphotography.com [${r.id}]`);
}

// 4. Deduplicate by email — keep the one with role=admin or highest createdAt, delete others
const byEmail = {};
for (const r of records) {
  const email = r.fields.email;
  if (!email || email === "admin@miphotography.com") continue;
  if (!byEmail[email]) byEmail[email] = [];
  byEmail[email].push(r);
}

for (const [email, dupes] of Object.entries(byEmail)) {
  if (dupes.length <= 1) continue;
  // Keep admin role first, then most recently created
  dupes.sort((a, b) => {
    if (a.fields.role === "admin" && b.fields.role !== "admin") return -1;
    if (b.fields.role === "admin" && a.fields.role !== "admin") return 1;
    return new Date(b.fields.createdAt || 0) - new Date(a.fields.createdAt || 0);
  });
  const [keep, ...remove] = dupes;
  console.log(`\n📧 ${email} — keeping [${keep.id}] (role: ${keep.fields.role}), removing ${remove.length} duplicate(s)`);
  for (const r of remove) {
    await table.destroy(r.id);
    console.log(`  ✅ Deleted duplicate [${r.id}]`);
  }
}

console.log("\n✅ Cleanup complete. Your Airtable Users table is clean.");
