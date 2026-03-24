"use client";

import { useState } from "react";
import type { AirtableSettings } from "@/lib/airtable";

type Tab = "profile" | "contact" | "social" | "notifications" | "booking";

const TABS: { key: Tab; label: string }[] = [
  { key: "profile",       label: "Photographer Profile" },
  { key: "contact",       label: "Contact Details" },
  { key: "social",        label: "Social Media" },
  { key: "notifications", label: "Notifications" },
  { key: "booking",       label: "Booking Page" },
];

const inputClass = "w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] transition-colors";
const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-1.5";

export function SettingsForm({ initial }: { initial: AirtableSettings | null }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [data, setData] = useState({
    photographerName:  initial?.photographerName  ?? "",
    tagline:           initial?.tagline           ?? "",
    bio:               initial?.bio               ?? "",
    contactEmail:      initial?.contactEmail      ?? "",
    phone:             initial?.phone             ?? "",
    instagram:         initial?.instagram         ?? "",
    facebook:          initial?.facebook          ?? "",
    notificationEmail: initial?.notificationEmail ?? "",
    bookingIntro:      initial?.bookingIntro      ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (key: keyof typeof data) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    try {
      const method = initial ? "PATCH" : "POST";
      const res = await fetch("/api/admin/settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: initial?.id }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* Tab bar */}
      <div className="flex border-b border-[#E8E4DF] mb-8 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap transition-colors -mb-px ${
              tab === key
                ? "border-b-2 border-[#C4A882] text-[#1A1A18]"
                : "text-[#6B6860] hover:text-[#1A1A18]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Photographer Profile */}
      {tab === "profile" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Photographer Name</label>
              <input value={data.photographerName} onChange={set("photographerName")} className={inputClass} placeholder="Miphotographer" />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input value={data.tagline} onChange={set("tagline")} className={inputClass} placeholder="Capturing life's finest moments" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea value={data.bio} onChange={set("bio")} rows={6} className={`${inputClass} resize-none`} placeholder="Tell clients about yourself, your style, and your approach…" />
          </div>
        </div>
      )}

      {/* Contact Details */}
      {tab === "contact" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Email</label>
              <input type="email" value={data.contactEmail} onChange={set("contactEmail")} className={inputClass} placeholder="hello@miphotography.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={data.phone} onChange={set("phone")} className={inputClass} placeholder="+1 555 000 0000" />
            </div>
          </div>
          <p className="text-xs text-[#6B6860]">These appear on the public contact and about pages.</p>
        </div>
      )}

      {/* Social Media */}
      {tab === "social" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Instagram Handle</label>
              <input value={data.instagram} onChange={set("instagram")} className={inputClass} placeholder="@miphotography" />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input value={data.facebook} onChange={set("facebook")} className={inputClass} placeholder="facebook.com/miphotography" />
            </div>
          </div>
          <p className="text-xs text-[#6B6860]">Social links appear in the footer and contact page.</p>
        </div>
      )}

      {/* Notifications */}
      {tab === "notifications" && (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Notification Email</label>
            <p className="text-xs text-[#6B6860] mb-2">
              Where to receive alerts for new bookings and inquiries. Separate from your login email.
            </p>
            <input type="email" value={data.notificationEmail} onChange={set("notificationEmail")} className={inputClass} placeholder="alerts@miphotography.com" />
          </div>
          <div className="bg-[#FAFAF9] border border-[#E8E4DF] px-4 py-3 text-xs text-[#6B6860]">
            Emails are sent via Resend. Make sure your domain is verified at resend.com/domains for reliable delivery.
          </div>
        </div>
      )}

      {/* Booking Page */}
      {tab === "booking" && (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Intro Text</label>
            <p className="text-xs text-[#6B6860] mb-2">
              Shown at the top of the public booking form — set expectations for clients.
            </p>
            <textarea value={data.bookingIntro} onChange={set("bookingIntro")} rows={5} className={`${inputClass} resize-none`} placeholder="Ready to book your session? Fill out the form below and I'll be in touch within 24 hours to confirm your date." />
          </div>
        </div>
      )}

      {/* Save bar — always visible */}
      <div className="pt-8 flex items-center gap-4">
        {error && <p className="text-sm text-red-500 flex-1">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
