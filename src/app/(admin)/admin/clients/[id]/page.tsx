import { notFound } from "next/navigation";
import {
  findById,
  findAll,
  Tables,
} from "@/lib/airtable";
import type {
  AirtableUser,
  AirtableBooking,
  AirtableClientGallery,
} from "@/lib/airtable";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:    "bg-amber-50 text-amber-700",
  Confirmed:  "bg-green-50 text-green-700",
  Completed:  "bg-blue-50 text-blue-700",
  Cancelled:  "bg-gray-100 text-gray-500",
  Processing: "bg-amber-50 text-amber-700",
  Ready:      "bg-green-50 text-green-700",
  Archived:   "bg-gray-100 text-gray-500",
};

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await findById<AirtableUser>(Tables.Users, id);
  if (!user) notFound();

  const [bookings, galleries] = await Promise.all([
    findAll<AirtableBooking>(Tables.Bookings, {
      filterFormula: `{email} = "${user.email}"`,
      sort: [{ field: "createdAt", direction: "desc" }],
    }),
    findAll<AirtableClientGallery>(Tables.ClientGalleries, {
      sort: [{ field: "createdAt", direction: "desc" }],
    }),
  ]);

  // Filter galleries belonging to this user
  const userGalleries = galleries.filter((g) => {
    const uid = Array.isArray(g.userId) ? g.userId[0] : g.userId;
    return uid === user.id;
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/clients"
          className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to clients
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8E4DF] flex items-center justify-center text-lg font-medium text-[#6B6860]">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A18]">
              {user.name ?? user.email}
            </h1>
            {user.name && (
              <p className="text-sm text-[#6B6860]">{user.email}</p>
            )}
            <p className="text-xs text-[#6B6860] mt-0.5">
              Joined {format(new Date(user.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <section>
        <h2 className="text-sm font-medium text-[#1A1A18] mb-3">
          Bookings ({bookings.length})
        </h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-[#6B6860] py-4">No bookings yet.</p>
        ) : (
          <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAF9] transition-colors group"
              >
                <div>
                  <p className="text-sm text-[#1A1A18]">
                    {b.packageName ?? b.sessionType ?? "Session"}
                  </p>
                  {b.sessionDate && (
                    <p className="text-xs text-[#6B6860] mt-0.5">
                      {format(new Date(b.sessionDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] tracking-wide uppercase font-medium px-2 py-0.5 ${STATUS_COLORS[b.status] ?? ""}`}>
                    {b.status}
                  </span>
                  <ExternalLink size={12} className="text-[#E8E4DF] group-hover:text-[#C4A882] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Galleries */}
      <section>
        <h2 className="text-sm font-medium text-[#1A1A18] mb-3">
          Galleries ({userGalleries.length})
        </h2>
        {userGalleries.length === 0 ? (
          <p className="text-sm text-[#6B6860] py-4">No galleries delivered yet.</p>
        ) : (
          <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
            {userGalleries.map((g) => (
              <Link
                key={g.id}
                href={`/admin/galleries/${g.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAF9] transition-colors group"
              >
                <div>
                  <p className="text-sm text-[#1A1A18]">{g.title}</p>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    {g.downloadEnabled ? "Downloads enabled" : "Downloads locked"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] tracking-wide uppercase font-medium px-2 py-0.5 ${STATUS_COLORS[g.status] ?? ""}`}>
                    {g.status}
                  </span>
                  <ExternalLink size={12} className="text-[#E8E4DF] group-hover:text-[#C4A882] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
