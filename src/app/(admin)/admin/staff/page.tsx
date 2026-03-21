"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Mail } from "lucide-react";
import type { AirtableUser } from "@/lib/airtable";

export default function StaffPage() {
  const [staff, setStaff]       = useState<AirtableUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/staff");
    if (res.ok) setStaff(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create staff member.");
        return;
      }
      setSuccess(`Invite sent to ${email}`);
      setName("");
      setEmail("");
      setShowForm(false);
      fetchStaff();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from staff? They will become a regular client.`)) return;
    await fetch("/api/admin/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchStaff();
  };

  const inputClass = "w-full border-b border-[#E8E4DF] bg-transparent py-3 text-sm text-[#1A1A18] placeholder-[#6B6860]/50 focus:outline-none focus:border-[#C4A882] transition-colors";
  const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-2";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A18]">Staff</h1>
          <p className="text-[#6B6860] text-sm mt-1">Manage admin accounts</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors"
        >
          <UserPlus size={14} />
          Add Staff
        </button>
      </div>

      {/* Success / error banners */}
      {success && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Add staff form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 border border-[#E8E4DF] bg-white space-y-5">
          <h2 className="text-sm font-medium text-[#1A1A18] tracking-wide">New staff member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-[#6B6860]">
            An invite email will be sent so they can set their password and access the admin panel.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending invite…" : "Send Invite"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="text-xs text-[#6B6860] hover:text-[#1A1A18] underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Staff list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-[#6B6860] text-sm">No staff members yet.</div>
      ) : (
        <div className="divide-y divide-[#E8E4DF] border border-[#E8E4DF]">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-5 py-4 bg-white hover:bg-[#FAFAF9] transition-colors">
              <div>
                <p className="text-sm font-medium text-[#1A1A18]">{member.name || "—"}</p>
                <p className="text-xs text-[#6B6860] flex items-center gap-1.5 mt-0.5">
                  <Mail size={11} /> {member.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-[#C4A882]/10 text-[#C4A882]">
                  Admin
                </span>
                <button
                  onClick={() => handleRemove(member.id, member.email)}
                  className="p-1.5 text-[#6B6860] hover:text-red-500 transition-colors"
                  title="Remove from staff"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
