import { findAll, Tables } from "@/lib/airtable";
import type { AirtableUser, AirtableBooking, AirtableClientGallery } from "@/lib/airtable";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ sort?: string; q?: string }>;
}

async function getData(sort: string) {
  const [users, bookings, galleries] = await Promise.all([
    findAll<AirtableUser>(Tables.Users, {
      filterFormula: '{role} = "client"',
      sort: [{ field: sort === "name" ? "name" : "createdAt", direction: sort === "asc" ? "asc" : "desc" }],
    }),
    findAll<AirtableBooking>(Tables.Bookings, { sort: [{ field: "createdAt", direction: "desc" }] }),
    findAll<AirtableClientGallery>(Tables.ClientGalleries, { sort: [{ field: "createdAt", direction: "desc" }] }),
  ]);
  return { users, bookings, galleries };
}

export default async function AdminClientsPage({ searchParams }: Props) {
  const { sort = "desc", q = "" } = await searchParams;
  const { users, bookings, galleries } = await getData(sort);

  const filtered = q
    ? users.filter((u) => `${u.name ?? ""} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
    : users;

  const bookingsByEmail = new Map<string, AirtableBooking[]>();
  for (const b of bookings) {
    const existing = bookingsByEmail.get(b.email) ?? [];
    existing.push(b);
    bookingsByEmail.set(b.email, existing);
  }

  const galleriesByUserId = new Map<string, AirtableClientGallery[]>();
  for (const g of galleries) {
    const uid = Array.isArray(g.userId) ? g.userId[0] : g.userId;
    if (!uid) continue;
    const existing = galleriesByUserId.get(uid) ?? [];
    existing.push(g);
    galleriesByUserId.set(uid, existing);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-[#C4A882]" />
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A18]">Clients</h1>
            <p className="text-sm text-[#6B6860] mt-0.5">{filtered.length} registered</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6860]">
          <span>Sort:</span>
          <Link href={`/admin/clients?sort=desc${q ? `&q=${q}` : ""}`} className={`px-2.5 py-1.5 border transition-colors ${sort === "desc" ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Newest</Link>
          <Link href={`/admin/clients?sort=asc${q ? `&q=${q}` : ""}`}  className={`px-2.5 py-1.5 border transition-colors ${sort === "asc"  ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Oldest</Link>
          <Link href={`/admin/clients?sort=name${q ? `&q=${q}` : ""}`} className={`px-2.5 py-1.5 border transition-colors ${sort === "name" ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>A–Z</Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#6B6860]">
          <Users size={32} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No clients yet. They appear here after signing in.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
          {filtered.map((user) => {
            const userBookings  = bookingsByEmail.get(user.email) ?? [];
            const userGalleries = galleriesByUserId.get(user.id) ?? [];
            const lastBooking   = userBookings[0];

            return (
              <Link
                key={user.id}
                href={`/admin/clients/${user.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF9] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-[#E8E4DF] flex items-center justify-center flex-shrink-0 text-sm font-medium text-[#6B6860]">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A18] truncate group-hover:text-[#C4A882] transition-colors">
                    {user.name ?? user.email}
                  </p>
                  {user.name && <p className="text-xs text-[#6B6860] truncate">{user.email}</p>}
                </div>
                <div className="hidden sm:flex items-center gap-6 text-xs text-[#6B6860]">
                  <div className="text-right">
                    <p className="font-medium text-[#1A1A18]">{userBookings.length}</p>
                    <p>booking{userBookings.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#1A1A18]">{userGalleries.length}</p>
                    <p>galeri{userGalleries.length !== 1 ? "es" : "y"}</p>
                  </div>
                  {lastBooking && (
                    <span className={`px-2 py-0.5 text-[10px] tracking-wide uppercase font-medium ${
                      lastBooking.status === "Pending"   ? "bg-amber-50 text-amber-700" :
                      lastBooking.status === "Confirmed" ? "bg-green-50 text-green-700" :
                      lastBooking.status === "Completed" ? "bg-blue-50 text-blue-700" :
                                                           "bg-gray-100 text-gray-500"
                    }`}>
                      {lastBooking.status}
                    </span>
                  )}
                </div>
                <ChevronRight size={14} className="text-[#E8E4DF] group-hover:text-[#C4A882] transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
