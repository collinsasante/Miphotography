import { NextRequest, NextResponse } from "next/server";
import { getBlockedDates } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get("timeMin") ?? new Date().toISOString();
  const timeMax = searchParams.get("timeMax") ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const blocked = await getBlockedDates(timeMin, timeMax);

  return NextResponse.json(blocked, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
