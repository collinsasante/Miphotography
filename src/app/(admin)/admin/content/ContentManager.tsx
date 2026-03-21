"use client";

import { useState } from "react";
import type { AirtablePackage, AirtableTestimonial, AirtableAvailability } from "@/lib/airtable";

type Tab = "packages" | "testimonials" | "availability";

const inputClass = "w-full border border-[#E8E4DF] bg-white px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] transition-colors";
const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-1";
const btnPrimary = "px-4 py-2 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-50";
const btnOutline = "px-3 py-1.5 border border-[#E8E4DF] text-xs text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882] transition-colors";

// ─── Packages ──────────────────────────────────────────────

function PackageForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<AirtablePackage>;
  onSave: (data: Partial<AirtablePackage>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price / 100) : "");
  const [duration, setDuration] = useState(initial?.duration != null ? String(initial.duration) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [includes, setIncludes] = useState(initial?.includes ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder != null ? String(initial.sortOrder) : "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      price: Math.round(parseFloat(price) * 100),
      duration: parseInt(duration),
      description,
      includes,
      isActive,
      sortOrder: parseInt(sortOrder),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAFAF9] border border-[#E8E4DF] p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Portrait Session" />
        </div>
        <div>
          <label className={labelClass}>Price ($) *</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" required className={inputClass} placeholder="500" />
        </div>
        <div>
          <label className={labelClass}>Duration (mins)</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="0" className={inputClass} placeholder="60" />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} type="number" className={inputClass} placeholder="0" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Short description shown to clients…" />
      </div>
      <div>
        <label className={labelClass}>Includes (one per line)</label>
        <textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder={"30 edited photos\n1-hour session\nOnline gallery access"} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
        <label htmlFor="isActive" className="text-sm text-[#6B6860]">Show on website</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>Save</button>
        <button type="button" onClick={onCancel} className={btnOutline}>Cancel</button>
      </div>
    </form>
  );
}

function PackagesTab({ initial }: { initial: AirtablePackage[] }) {
  const [packages, setPackages] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAdd = async (data: Partial<AirtablePackage>) => {
    setLoading("add");
    const res = await fetch("/api/admin/content/packages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const pkg = await res.json();
      setPackages((p) => [...p, pkg]);
      setAdding(false);
    }
    setLoading(null);
  };

  const handleEdit = async (id: string, data: Partial<AirtablePackage>) => {
    setLoading(id);
    const res = await fetch(`/api/admin/content/packages/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const pkg = await res.json();
      setPackages((p) => p.map((x) => (x.id === id ? pkg : x)));
      setEditingId(null);
    }
    setLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    setLoading(id);
    const res = await fetch(`/api/admin/content/packages/${id}`, { method: "DELETE" });
    if (res.ok) setPackages((p) => p.filter((x) => x.id !== id));
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setAdding(true)} className={btnPrimary} disabled={adding}>+ Add Package</button>
      </div>
      {adding && (
        <PackageForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      )}
      <div className="space-y-2">
        {packages.map((pkg) =>
          editingId === pkg.id ? (
            <PackageForm key={pkg.id} initial={pkg} onSave={(d) => handleEdit(pkg.id, d)} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={pkg.id} className="bg-white border border-[#E8E4DF] px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-sm text-[#1A1A18]">{pkg.name}</p>
                  {!pkg.isActive && <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 bg-gray-100 text-gray-500">Hidden</span>}
                </div>
                <p className="text-xs text-[#6B6860] mt-0.5">
                  ${(pkg.price / 100).toFixed(0)} · {pkg.duration}min
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditingId(pkg.id)} className={btnOutline} disabled={loading === pkg.id}>Edit</button>
                <button onClick={() => handleDelete(pkg.id)} className="px-3 py-1.5 border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-colors" disabled={loading === pkg.id}>Delete</button>
              </div>
            </div>
          )
        )}
        {packages.length === 0 && !adding && (
          <p className="text-center py-12 text-sm text-[#6B6860]">No packages yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Testimonials ──────────────────────────────────────────

function TestimonialForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<AirtableTestimonial>;
  onSave: (data: Partial<AirtableTestimonial>) => void;
  onCancel: () => void;
}) {
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [clientTitle, setClientTitle] = useState(initial?.clientTitle ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder != null ? String(initial.sortOrder) : "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ clientName, clientTitle, body, rating, isPublished, sortOrder: parseInt(sortOrder) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAFAF9] border border-[#E8E4DF] p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Client Name *</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} required className={inputClass} placeholder="Jane Smith" />
        </div>
        <div>
          <label className={labelClass}>Title / Context</label>
          <input value={clientTitle} onChange={(e) => setClientTitle(e.target.value)} className={inputClass} placeholder="Wedding couple, 2024" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Review *</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} className={`${inputClass} resize-none`} placeholder="What the client said…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Rating (1–5)</label>
          <input value={rating} onChange={(e) => setRating(parseInt(e.target.value))} type="number" min="1" max="5" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} type="number" className={inputClass} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        <label htmlFor="isPublished" className="text-sm text-[#6B6860]">Published on website</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>Save</button>
        <button type="button" onClick={onCancel} className={btnOutline}>Cancel</button>
      </div>
    </form>
  );
}

function TestimonialsTab({ initial }: { initial: AirtableTestimonial[] }) {
  const [testimonials, setTestimonials] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAdd = async (data: Partial<AirtableTestimonial>) => {
    setLoading("add");
    const res = await fetch("/api/admin/content/testimonials", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const t = await res.json();
      setTestimonials((p) => [...p, t]);
      setAdding(false);
    }
    setLoading(null);
  };

  const handleEdit = async (id: string, data: Partial<AirtableTestimonial>) => {
    setLoading(id);
    const res = await fetch(`/api/admin/content/testimonials/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const t = await res.json();
      setTestimonials((p) => p.map((x) => (x.id === id ? t : x)));
      setEditingId(null);
    }
    setLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    setLoading(id);
    const res = await fetch(`/api/admin/content/testimonials/${id}`, { method: "DELETE" });
    if (res.ok) setTestimonials((p) => p.filter((x) => x.id !== id));
    setLoading(null);
  };

  const handleToggle = async (id: string, current: boolean) => {
    setLoading(id);
    const res = await fetch(`/api/admin/content/testimonials/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      const t = await res.json();
      setTestimonials((p) => p.map((x) => (x.id === id ? t : x)));
    }
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setAdding(true)} className={btnPrimary} disabled={adding}>+ Add Testimonial</button>
      </div>
      {adding && <TestimonialForm onSave={handleAdd} onCancel={() => setAdding(false)} />}
      <div className="space-y-2">
        {testimonials.map((t) =>
          editingId === t.id ? (
            <TestimonialForm key={t.id} initial={t} onSave={(d) => handleEdit(t.id, d)} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={t.id} className="bg-white border border-[#E8E4DF] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-[#1A1A18]">{t.clientName}</p>
                    {t.clientTitle && <p className="text-xs text-[#6B6860]">· {t.clientTitle}</p>}
                    <span className="text-xs text-[#C4A882]">{"★".repeat(t.rating)}</span>
                    {!t.isPublished && <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 bg-gray-100 text-gray-500">Hidden</span>}
                  </div>
                  <p className="text-sm text-[#6B6860] leading-relaxed line-clamp-2">{t.body}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(t.id, t.isPublished)} className={btnOutline} disabled={loading === t.id}>
                    {t.isPublished ? "Hide" : "Publish"}
                  </button>
                  <button onClick={() => setEditingId(t.id)} className={btnOutline} disabled={loading === t.id}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-colors" disabled={loading === t.id}>Delete</button>
                </div>
              </div>
            </div>
          )
        )}
        {testimonials.length === 0 && !adding && (
          <p className="text-center py-12 text-sm text-[#6B6860]">No testimonials yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Availability ─────────────────────────────────────────

function AvailabilityTab({ initial }: { initial: AirtableAvailability[] }) {
  const [blocks, setBlocks] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) return;
    setLoading("add");
    const res = await fetch("/api/admin/content/availability", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: start, endDate: end, reason }),
    });
    if (res.ok) {
      const block = await res.json();
      setBlocks((p) => [...p, block]);
      setAdding(false); setStart(""); setEnd(""); setReason("");
    }
    setLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this date block?")) return;
    setLoading(id);
    const res = await fetch(`/api/admin/content/availability/${id}`, { method: "DELETE" });
    if (res.ok) setBlocks((p) => p.filter((x) => x.id !== id));
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setAdding(true)} className={btnPrimary} disabled={adding}>+ Block Dates</button>
      </div>
      {adding && (
        <form onSubmit={handleAdd} className="bg-[#FAFAF9] border border-[#E8E4DF] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Reason (internal)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="Vacation, holiday, etc." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimary} disabled={loading === "add"}>Save Block</button>
            <button type="button" onClick={() => setAdding(false)} className={btnOutline}>Cancel</button>
          </div>
        </form>
      )}
      <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
        {blocks.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-5 py-3 gap-4">
            <div>
              <p className="text-sm text-[#1A1A18] font-medium">
                {b.startDate} → {b.endDate}
              </p>
              {b.reason && <p className="text-xs text-[#6B6860] mt-0.5">{b.reason}</p>}
            </div>
            <button onClick={() => handleDelete(b.id)} className="px-3 py-1.5 border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-colors" disabled={loading === b.id}>
              Remove
            </button>
          </div>
        ))}
        {blocks.length === 0 && !adding && (
          <div className="text-center py-12 text-sm text-[#6B6860]">No date blocks. Clients can book any available date.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main ContentManager ──────────────────────────────────

export function ContentManager({
  initialPackages,
  initialTestimonials,
  initialAvailability,
}: {
  initialPackages: AirtablePackage[];
  initialTestimonials: AirtableTestimonial[];
  initialAvailability: AirtableAvailability[];
}) {
  const [tab, setTab] = useState<Tab>("packages");

  const TABS: { key: Tab; label: string }[] = [
    { key: "packages",     label: "Packages & Pricing" },
    { key: "testimonials", label: "Testimonials" },
    { key: "availability", label: "Availability" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A18]">Content</h1>
        <p className="text-sm text-[#6B6860] mt-1">Manage your packages, reviews, and blocked dates.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E4DF]">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-3 text-xs tracking-widest uppercase transition-colors -mb-px ${
              tab === key
                ? "border-b-2 border-[#C4A882] text-[#1A1A18]"
                : "text-[#6B6860] hover:text-[#1A1A18]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "packages"     && <PackagesTab     initial={initialPackages}     />}
      {tab === "testimonials" && <TestimonialsTab  initial={initialTestimonials} />}
      {tab === "availability" && <AvailabilityTab  initial={initialAvailability} />}
    </div>
  );
}
