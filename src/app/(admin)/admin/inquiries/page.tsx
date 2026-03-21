import { findAll, Tables } from "@/lib/airtable";
import type { AirtableInquiry } from "@/lib/airtable";
import { format } from "date-fns";
import Link from "next/link";
import { InquiryItem } from "./InquiryItem";

interface Props {
  searchParams: Promise<{ status?: string; sort?: string }>;
}

const STATUSES = ["All", "New", "Read", "Replied", "Archived"];

export default async function AdminInquiriesPage({ searchParams }: Props) {
  const { status, sort = "desc" } = await searchParams;

  const inquiries = await findAll<AirtableInquiry>(Tables.Inquiries, {
    filterFormula: status ? `{status} = "${status}"` : "",
    sort: [{ field: "createdAt", direction: sort === "asc" ? "asc" : "desc" }],
  });

  const newCount = inquiries.filter((i) => i.status === "New").length;
  const sortBase = status ? `?status=${status}&sort=` : "?sort=";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A18]">Inquiries</h1>
          <p className="text-sm text-[#6B6860] mt-1">
            {newCount > 0 ? `${newCount} new` : `${inquiries.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B6860]">
          <span>Sort:</span>
          <Link href={`/admin/inquiries${sortBase}desc`} className={`px-2.5 py-1.5 border transition-colors ${sort !== "asc" ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Newest</Link>
          <Link href={`/admin/inquiries${sortBase}asc`}  className={`px-2.5 py-1.5 border transition-colors ${sort === "asc"  ? "border-[#C4A882] text-[#C4A882]" : "border-[#E8E4DF] hover:border-[#C4A882]"}`}>Oldest</Link>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "All"
                ? `/admin/inquiries${sort !== "desc" ? `?sort=${sort}` : ""}`
                : `/admin/inquiries?status=${s}${sort !== "desc" ? `&sort=${sort}` : ""}`
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

      {inquiries.length === 0 ? (
        <div className="text-center py-16 text-[#6B6860] text-sm border border-dashed border-[#E8E4DF]">
          No inquiries found.
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
          {inquiries.map((inquiry) => (
            <InquiryItem key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );
}
