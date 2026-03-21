import { NextRequest, NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations/booking";
import { create, findById, Tables } from "@/lib/airtable";
import type { AirtableBooking, AirtablePackage } from "@/lib/airtable";
import { sendEmail, bookingConfirmationEmail, adminBookingNotificationEmail } from "@/lib/email";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  let packageName = data.packageName;
  if (data.packageId && !packageName) {
    const pkg = await findById<AirtablePackage>(Tables.Packages, data.packageId);
    packageName = pkg?.name;
  }

  const booking = await create<AirtableBooking>(Tables.Bookings, {
    name:        data.name,
    email:       data.email,
    phone:       data.phone ?? "",
    packageId:   data.packageId ? [data.packageId] : [],
    packageName: packageName ?? "",
    sessionDate: data.sessionDate ?? "",
    sessionType: data.sessionType ?? "",
    location:    data.location ?? "",
    notes:       data.notes ?? "",
    status:      "Pending",
    createdAt:   new Date().toISOString(),
  });

  // Fire emails async
  const confirmEmail = bookingConfirmationEmail({
    name:        data.name,
    bookingId:   booking.id,
    sessionDate: data.sessionDate,
    packageName,
  });

  const adminEmail = adminBookingNotificationEmail({
    name:        data.name,
    email:       data.email,
    bookingId:   booking.id,
    packageName,
    sessionDate: data.sessionDate,
    notes:       data.notes,
  });

  await Promise.allSettled([
    sendEmail({ ...confirmEmail, to: data.email }),
    sendEmail(adminEmail),
  ]);

  return NextResponse.json({ success: true, bookingId: booking.id });
}
