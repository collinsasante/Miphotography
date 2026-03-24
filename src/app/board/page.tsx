"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface Session {
  id: string;
  display: string;
  packageName: string | null;
  sessionDate: string | null;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

interface AvailabilityBlock {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface BoardData {
  today: string;
  blockedToday: boolean;
  todayBookings: Session[];
  upcomingBookings: Session[];
  availability: AvailabilityBlock[];
  studioName: string;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:   "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
  Confirmed: "bg-green-500/20  text-green-300  border border-green-500/40",
  Completed: "bg-zinc-500/20   text-zinc-400   border border-zinc-500/40",
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GH", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
  });
}

function groupByDate(sessions: Session[]) {
  const map = new Map<string, Session[]>();
  for (const s of sessions) {
    const key = s.sessionDate ?? "TBD";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

export default function BoardPage() {
  const [data, setData]       = useState<BoardData | null>(null);
  const [clock, setClock]     = useState("");
  const [lastSync, setLastSync] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/board", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json() as BoardData;
        setData(json);
        setLastSync(new Date().toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch data + auto-refresh every 30 s
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Studio status
  const studioStatus = (() => {
    if (!data) return null;
    if (data.blockedToday) return { label: "Unavailable", color: "text-red-400",   bg: "bg-red-500/10   border-red-500/30" };
    const confirmed = data.todayBookings.filter((b) => b.status === "Confirmed");
    const pending   = data.todayBookings.filter((b) => b.status === "Pending");
    if (confirmed.length > 0) return { label: "In Session",   color: "text-yellow-300", bg: "bg-yellow-500/10 border-yellow-500/30" };
    if (pending.length > 0)   return { label: "Pending Bookings", color: "text-blue-300", bg: "bg-blue-500/10 border-blue-500/30" };
    return { label: "Open", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" };
  })();

  const grouped = data ? groupByDate(data.upcomingBookings) : new Map<string, Session[]>();

  return (
    <div className="min-h-screen bg-[#0D0D0B] text-white font-sans flex flex-col">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Miphotographer" width={44} height={44} className="rounded-full object-cover" />
          <div>
            <p className="text-xs tracking-widest uppercase text-white/40">Studio Live Board</p>
            <h1 className="font-serif text-2xl font-semibold leading-tight">
              {data?.studioName ?? "Miphotographer"}
            </h1>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-bold tabular-nums tracking-tight">{clock}</p>
          <p className="text-sm text-white/40">
            {data ? formatDate(data.today) : ""}
          </p>
        </div>
      </header>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-white/30 text-lg">
          Loading...
        </div>
      )}

      {!loading && data && (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10">

          {/* ── Col 1: Status + Today ── */}
          <section className="p-8 flex flex-col gap-6">

            {/* Studio status */}
            <div className={`rounded-2xl border px-6 py-5 ${studioStatus?.bg}`}>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Studio Status</p>
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${studioStatus?.color.replace("text-", "bg-")} animate-pulse`} />
                <span className={`text-2xl font-semibold ${studioStatus?.color}`}>
                  {studioStatus?.label}
                </span>
              </div>
            </div>

            {/* Today's sessions */}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Today&apos;s Sessions</p>
              {data.todayBookings.length === 0 ? (
                <p className="text-white/30 text-sm">No sessions scheduled for today.</p>
              ) : (
                <ul className="space-y-3">
                  {data.todayBookings.map((s, i) => (
                    <li key={s.id} className="flex items-start justify-between gap-4 bg-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="text-white/20 text-sm pt-0.5 w-5 shrink-0">{i + 1}.</span>
                        <div>
                          <p className="font-semibold text-base">{s.display}</p>
                          {s.packageName && (
                            <p className="text-sm text-white/50">{s.packageName}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_STYLE[s.status] ?? ""}`}>
                        {s.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ── Col 2: Upcoming this week ── */}
          <section className="p-8">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Upcoming This Week</p>

            {grouped.size === 0 ? (
              <p className="text-white/30 text-sm">No confirmed sessions in the next 7 days.</p>
            ) : (
              <div className="space-y-6">
                {Array.from(grouped.entries()).map(([date, sessions]) => (
                  <div key={date}>
                    <p className="text-sm font-semibold text-white/60 mb-2">
                      {date === "TBD" ? "Date TBD" : formatDate(date)}
                    </p>
                    <ul className="space-y-2">
                      {sessions.map((s) => (
                        <li key={s.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                          <div>
                            <p className="font-medium">{s.display}</p>
                            {s.packageName && (
                              <p className="text-xs text-white/40">{s.packageName}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[s.status] ?? ""}`}>
                            {s.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Blocked dates */}
            {data.availability.length > 0 && (
              <div className="mt-8">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Unavailable Dates</p>
                <ul className="space-y-2">
                  {data.availability.map((a) => (
                    <li key={a.id} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-300 font-medium">
                        {a.startDate === a.endDate
                          ? formatDate(a.startDate)
                          : `${formatDate(a.startDate)} - ${formatDate(a.endDate)}`}
                      </p>
                      {a.reason && <p className="text-xs text-red-400/60 mt-0.5">{a.reason}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ── Col 3: Book + Contact ── */}
          <section className="p-8 flex flex-col gap-8">

            {/* Book now */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Book a Session</p>
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-2xl px-6 py-5 space-y-2">
                <p className="text-[#C9A96E] font-semibold text-lg">Visit Our Website</p>
                <p className="text-white/60 text-sm break-all">miphotography.mr-asanteeprog.workers.dev/booking</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Contact Us</p>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-xs text-white/40 mb-0.5">Call / WhatsApp</p>
                  <p className="text-lg font-semibold tracking-wide">0538 523 381</p>
                </div>
                <div className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-xs text-white/40 mb-0.5">Alternative</p>
                  <p className="text-lg font-semibold tracking-wide">0205 859 006</p>
                </div>
                <div className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-xs text-white/40 mb-0.5">Email</p>
                  <p className="text-sm font-medium text-white/80">Kissirichsmanuel3@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Payment</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: "MTN MoMo",       value: "0538 523 381" },
                  { label: "Vodafone Cash",   value: "0205 859 006" },
                  { label: "CalBank",         value: "1400008198359" },
                ].map((p) => (
                  <div key={p.label} className="flex justify-between bg-white/5 rounded-lg px-4 py-2.5">
                    <span className="text-white/50">{p.label}</span>
                    <span className="font-mono font-medium">{p.value}</span>
                  </div>
                ))}
                <p className="text-xs text-white/30 pt-1 text-center">Account: Emmanuel Kissiedu</p>
              </div>
            </div>

          </section>
        </main>
      )}

      {/* ── Footer ── */}
      <footer className="px-8 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/20">
        <span>Auto-refreshes every 30 seconds</span>
        {lastSync && <span>Last updated: {lastSync}</span>}
      </footer>
    </div>
  );
}
