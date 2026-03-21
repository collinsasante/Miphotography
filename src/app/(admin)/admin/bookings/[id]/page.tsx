import { notFound } from "next/navigation";
import { findById, update, Tables } from "@/lib/airtable";
import type { AirtableBooking } from "@/lib/airtable";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/calendar";

interface Props {
  params: Promise<{ id: string }>;
}

// Server actions for booking management
async function updateBookingStatus(formData: FormData) {
  "use server";
  const id     = formData.get("id") as string;
  const status = formData.get("status") as string;
  const booking = await findById<AirtableBooking>(Tables.Bookings, id);
  if (!booking) return;

  if (status === "Confirmed" && booking.sessionDate) {
    // Create Google Calendar event
    const start = new Date(booking.sessionDate);
    start.setHours(10, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    const eventId = await createCalendarEvent({
      summary: `📸 Session — ${booking.name}`,
      description: `Package: ${booking.packageName ?? "TBD"}\nNotes: ${booking.notes ?? ""}`,
      location: booking.location,
      startDateTime: start.toISOString(),
      endDateTime:   end.toISOString(),
      attendeeEmail: booking.email,
    });

    await update(Tables.Bookings, id, {
      status,
      calendarEventId: eventId ?? "",
    });
  } else if (status === "Cancelled" && booking.calendarEventId) {
    await deleteCalendarEvent(booking.calendarEventId);
    await update(Tables.Bookings, id, { status, calendarEventId: "" });
  } else {
    await update(Tables.Bookings, id, { status });
  }

  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const booking = await findById<AirtableBooking>(Tables.Bookings, id);
  if (!booking) notFound();

  const STATUS_ACTIONS: Record<string, string[]> = {
    Pending:   ["Confirmed", "Cancelled"],
    Confirmed: ["Completed", "Cancelled"],
    Completed: [],
    Cancelled: [],
  };

  const nextStatuses = STATUS_ACTIONS[booking.status] ?? [];

  const FIELD_COLORS: Record<string, string> = {
    Pending:   "text-amber-700",
    Confirmed: "text-green-700",
    Completed: "text-blue-700",
    Cancelled: "text-red-700",
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/admin/bookings" className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to bookings
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A18]">{booking.name}</h1>
            <p className="text-sm text-[#6B6860] mt-1">{booking.email}</p>
          </div>
          <span className={`text-sm font-medium ${FIELD_COLORS[booking.status]}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white border border-[#E8E4DF] divide-y divide-[#E8E4DF]">
        {[
          { label: "Phone",        value: booking.phone },
          { label: "Package",      value: booking.packageName },
          { label: "Session Date", value: booking.sessionDate ? format(new Date(booking.sessionDate), "MMMM d, yyyy") : undefined },
          { label: "Session Type", value: booking.sessionType },
          { label: "Location",     value: booking.location },
          { label: "Notes",        value: booking.notes },
          { label: "Calendar",     value: booking.calendarEventId ? "Synced ✓" : undefined },
          { label: "Submitted",    value: format(new Date(booking.createdAt), "MMMM d, yyyy 'at' h:mm a") },
        ]
          .filter(({ value }) => !!value)
          .map(({ label, value }) => (
            <div key={label} className="flex gap-4 px-5 py-3">
              <span className="text-xs text-[#6B6860] w-28 flex-shrink-0 pt-0.5">{label}</span>
              <span className="text-sm text-[#1A1A18]">{value}</span>
            </div>
          ))}
      </div>

      {/* Actions */}
      {nextStatuses.length > 0 && (
        <div className="flex gap-3">
          {nextStatuses.map((s) => (
            <form key={s} action={updateBookingStatus}>
              <input type="hidden" name="id" value={booking.id} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-colors ${
                  s === "Cancelled"
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-[#1A1A18] text-white hover:bg-[#C4A882]"
                }`}
              >
                Mark {s}
                {s === "Confirmed" && booking.sessionDate ? " + Add to Calendar" : ""}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
