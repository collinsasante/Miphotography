"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Send } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  New:      "bg-amber-50 text-amber-700",
  Read:     "bg-[#F5F5F4] text-[#6B6860]",
  Replied:  "bg-green-50 text-green-700",
  Archived: "bg-[#F5F5F4] text-[#9e9e9e]",
};

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export function InquiryItem({ inquiry }: { inquiry: Inquiry }) {
  const [expanded, setExpanded] = useState(inquiry.status === "New");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState(inquiry.status);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkRead = async () => {
    const res = await fetch(`/api/admin/inquiries/${inquiry.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Read" }),
    });
    if (res.ok) setStatus("Read");
  };

  const handleArchive = async () => {
    const res = await fetch(`/api/admin/inquiries/${inquiry.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Archived" }),
    });
    if (res.ok) setStatus("Archived");
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText, subject: inquiry.subject }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setStatus("Replied");
      setReplyOpen(false);
      setReplyText("");
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-5">
      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-0.5">
              <p className="font-medium text-sm text-[#1A1A18]">{inquiry.name}</p>
              <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${STATUS_COLORS[status]}`}>
                {status}
              </span>
              {sent && (
                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 bg-green-50 text-green-700">
                  Replied ✓
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B6860]">
              {inquiry.email} · {inquiry.type} · {format(new Date(inquiry.createdAt), "MMM d, yyyy")}
            </p>
            {inquiry.subject && !expanded && (
              <p className="text-sm text-[#1A1A18] mt-1 truncate">{inquiry.subject}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-[#6B6860]">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {inquiry.subject && (
            <p className="text-sm font-medium text-[#1A1A18]">{inquiry.subject}</p>
          )}
          <p className="text-sm text-[#6B6860] leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {status === "New" && (
              <button
                onClick={handleMarkRead}
                className="text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882] transition-colors"
              >
                Mark read
              </button>
            )}
            {status !== "Archived" && (
              <button
                onClick={handleArchive}
                className="text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[#E8E4DF] text-[#6B6860] hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Archive
              </button>
            )}
            {status !== "Archived" && (
              <button
                onClick={() => setReplyOpen((v) => !v)}
                className="text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[#C4A882] text-[#C4A882] hover:bg-[#C4A882] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Send size={11} /> {replyOpen ? "Cancel" : "Reply"}
              </button>
            )}
            <a
              href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject ?? "Your inquiry")}`}
              className="text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882] transition-colors"
            >
              Open in email
            </a>
          </div>

          {/* Reply form */}
          {replyOpen && (
            <div className="bg-[#FAFAF9] border border-[#E8E4DF] p-4 space-y-3">
              <p className="text-[10px] tracking-widest uppercase text-[#6B6860]">
                Reply to {inquiry.name} &lt;{inquiry.email}&gt;
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Type your reply…"
                className="w-full border border-[#E8E4DF] bg-white px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#C4A882] resize-none transition-colors"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-50"
              >
                <Send size={12} />
                {sending ? "Sending…" : "Send Reply"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
