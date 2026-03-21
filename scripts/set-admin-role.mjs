/**
 * One-time script: sets a user's role to "admin" in Airtable.
 * Usage: node scripts/set-admin-role.mjs
 */
import Airtable from "airtable";
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

const TARGET_EMAIL = "admin@miphotography.com";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

const records = await base("Users")
  .select({ filterByFormula: `{email} = "${TARGET_EMAIL}"`, maxRecords: 1 })
  .firstPage();

if (!records.length) {
  console.log("❌ User not found in Airtable. Log in first, then run this script.");
  process.exit(1);
}

await base("Users").update(records[0].id, { role: "admin" });
console.log(`✅ ${TARGET_EMAIL} is now admin in Airtable.`);
console.log("Restart your dev server, then log in at http://localhost:3000/login");
