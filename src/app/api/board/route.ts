import { NextResponse } from "next/server";
import {
  findAll,
  findOne,
  Tables,
  type AirtableBooking,
  type AirtableAvailability,
  type AirtableSettings,
} from "@/lib/airtable";

function isoDate(offset = 0) {
  return new Date(Date.now() + offset * 864e5).toISOString().split("T")[0];
}

function sanitizeName(full: string) {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

export async function GET() {
  const today = isoDate(0);
  const in7    = isoDate(7);

  const [todayBookings, upcomingBookings, availability, settings] = await Promise.all([
    findAll<AirtableBooking>(Tables.Bookings, {
      filterFormula: `AND({sessionDate} = "${today}", {status} != "Cancelled")`,
      sort: [{ field: "createdAt", direction: "asc" }],
    }),
    findAll<AirtableBooking>(Tables.Bookings, {
      filterFormula: `AND({sessionDate} > "${today}", {sessionDate} <= "${in7}", {status} = "Confirmed")`,
      sort: [{ field: "sessionDate", direction: "asc" }],
      maxRecords: 15,
    }),
    findAll<AirtableAvailability>(Tables.Availability, {
      filterFormula: `AND({startDate} <= "${in7}", {endDate} >= "${today}")`,
    }),
    findOne<AirtableSettings>(Tables.Settings, `{photographerName} != ""`),
  ]);

  // Is today blocked in availability?
  const blockedToday = availability.some(
    (a) => a.startDate <= today && a.endDate >= today
  );

  return NextResponse.json({
    today,
    blockedToday,
    todayBookings: todayBookings.map((b) => ({
      id: b.id,
      display: sanitizeName(b.name),
      packageName: b.packageName ?? null,
      sessionDate: b.sessionDate ?? null,
      status: b.status,
    })),
    upcomingBookings: upcomingBookings.map((b) => ({
      id: b.id,
      display: sanitizeName(b.name),
      packageName: b.packageName ?? null,
      sessionDate: b.sessionDate ?? null,
      status: b.status,
    })),
    availability,
    studioName: settings?.photographerName ?? "Miphotographer",
  });
}
