import { findAll, Tables } from "@/lib/airtable";
import type { AirtableBooking } from "@/lib/airtable";
import Link from "next/link";
import { format } from "date-fns";

interface Props {
  searchParams: Promise<{ status?: string; sort?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-amber-50 text-amber-700",
  Confirmed: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-700",
};

const STATUSES = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status, sort = "desc" } = await searchParams;

  const bookings = await findAll<AirtableBooking>(Tables.Bookings, {
    filterFormula: status ? `{status} = "${status}"` : "",
    sort: [{ field: "createdAt", direction: sort === "asc" ? "asc" : "desc" }],
  });

  const sortBase = status ? `?status=${status}&sort=` : "?sort=";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A18]">Bookings</h1>
          <p className="text-sm text-[#6B6860] mt-1">{bookings.length} total</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6860]">
          <span>Sort:</span>
          <Link href={`/admin/bookings${sortBase}desc`} className={`px-2.5 py-1.5 border transition-colors ${sort !== "asc" ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Newest</Link>
          <Link href={`/admin/bookings${sortBase}asc`}  className={`px-2.5 py-1.5 border transition-colors ${sort === "asc"  ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Oldest</Link>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "All"
                ? `/admin/bookings${sort !== "desc" ? `?sort=${sort}` : ""}`
                : `/admin/bookings?status=${s}${sort !== "desc" ? `&sort=${sort}` : ""}`
            }
            className={`text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors ${
              (s === "All" && !status) || s === status
                ? "border-[#C4A882] bg-[#C4A882] text-white"
                : "border-[#E8E4DF] text-[#6B6860] hover:border-[#C4A882] hover:text-[#C4A882]"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Clickable rows — full row is a Link */}
      <div className="bg-white border border-[#E8E4DF]">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-[#E8E4DF] px-4 py-3">
          {["Client", "Package", "Session Date", "Status", "Submitted"].map((h) => (
            <div key={h} className="text-[10px] tracking-widest uppercase text-[#6B6860]">{h}</div>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 text-[#6B6860] text-sm">No bookings found.</div>
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/admin/bookings/${booking.id}`}
              className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-3.5 border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9] transition-colors group gap-1 sm:gap-0 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-[#1A1A18] group-hover:text-[#C4A882] transition-colors">{booking.name}</p>
                <p className="text-xs text-[#6B6860]">{booking.email}</p>
              </div>
              <div className="flex items-center text-sm text-[#6B6860]">{booking.packageName ?? "—"}</div>
              <div className="flex items-center text-sm text-[#6B6860]">
                {booking.sessionDate ? format(new Date(booking.sessionDate), "MMM d, yyyy") : "—"}
              </div>
              <div className="flex items-center">
                <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 ${STATUS_COLORS[booking.status] ?? "bg-gray-50 text-gray-600"}`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center text-xs text-[#6B6860]">
                {format(new Date(booking.createdAt), "MMM d, yyyy")}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
