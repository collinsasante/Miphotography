import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyFirebaseToken } from "@/lib/firebase-verify";
import { findAll, findOne, Tables } from "@/lib/airtable";
import type { AirtableBooking, AirtableInquiry, AirtableClientGallery, AirtableUser } from "@/lib/airtable";
import Link from "next/link";
import { Calendar, Image, MessageSquare } from "lucide-react";

async function getStats() {
  const [bookings, inquiries, galleries] = await Promise.all([
    findAll<AirtableBooking>(Tables.Bookings, {
      filterFormula: '{status} = "Pending"',
      maxRecords: 50,
    }),
    findAll<AirtableInquiry>(Tables.Inquiries, {
      filterFormula: '{status} = "New"',
      maxRecords: 50,
    }),
    findAll<AirtableClientGallery>(Tables.ClientGalleries, {
      filterFormula: '{status} = "Ready"',
      maxRecords: 50,
    }),
  ]);

  const recentBookings = await findAll<AirtableBooking>(Tables.Bookings, {
    sort: [{ field: "createdAt", direction: "desc" }],
    maxRecords: 8,
  });

  return {
    pendingBookings: bookings.length,
    newInquiries:    inquiries.length,
    activeGalleries: galleries.length,
    recentBookings,
  };
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) redirect("/login");
  const payload = await verifyFirebaseToken(token);
  if (!payload) redirect("/login");
  const user = await findOne<AirtableUser>(Tables.Users, `{firebaseUid} = "${payload.uid}"`);
  if (!user || user.role !== "admin") redirect("/client");

  const stats = await getStats();

  const STATUS_COLORS: Record<string, string> = {
    Pending:   "bg-amber-50 text-amber-700",
    Confirmed: "bg-green-50 text-green-700",
    Completed: "bg-blue-50 text-blue-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A18]">Dashboard</h1>
        <p className="text-sm text-[#6B6860] mt-1">Overview of your business activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Bookings", value: stats.pendingBookings, icon: Calendar, href: "/admin/bookings?status=Pending", urgent: stats.pendingBookings > 0 },
          { label: "New Inquiries",    value: stats.newInquiries,    icon: MessageSquare, href: "/admin/inquiries", urgent: stats.newInquiries > 0 },
          { label: "Active Galleries", value: stats.activeGalleries, icon: Image, href: "/admin/galleries", urgent: false },
        ].map(({ label, value, icon: Icon, href, urgent }) => (
          <Link
            key={label}
            href={href}
            className="p-6 bg-white border border-[#E8E4DF] hover:border-[#C4A882] transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#6B6860] mb-2">{label}</p>
                <p className={`text-3xl font-light ${urgent ? "text-[#C4A882]" : "text-[#1A1A18]"}`}>
                  {value}
                </p>
              </div>
              <Icon size={18} className="text-[#6B6860] group-hover:text-[#C4A882] transition-colors mt-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white border border-[#E8E4DF]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
          <h2 className="font-medium text-sm text-[#1A1A18]">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-[#C4A882] hover:underline">View all →</Link>
        </div>
        <div className="divide-y divide-[#E8E4DF]">
          {stats.recentBookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/admin/bookings/${booking.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAF9] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[#1A1A18]">{booking.name}</p>
                <p className="text-xs text-[#6B6860] mt-0.5">{booking.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {booking.sessionDate && (
                  <span className="text-xs text-[#6B6860] hidden sm:block">{booking.sessionDate}</span>
                )}
                <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 ${STATUS_COLORS[booking.status] ?? "bg-[#F5F5F4] text-[#6B6860]"}`}>
                  {booking.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
