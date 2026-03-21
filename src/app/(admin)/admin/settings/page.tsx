import { findAll, Tables } from "@/lib/airtable";
import type { AirtableSettings } from "@/lib/airtable";
import { SettingsForm } from "./SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const rows = await findAll<AirtableSettings>(Tables.Settings, { maxRecords: 1 });
  const settings = rows[0] ?? null;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A18]">Settings</h1>
        <p className="text-sm text-[#6B6860] mt-1">Your photographer profile and notification preferences.</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
