import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebase-verify";
import { findOne, findAll, Tables } from "@/lib/airtable";
import type { AirtableUser, AirtableClientGallery } from "@/lib/airtable";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) return NextResponse.json([], { status: 401 });

  const payload = await verifyFirebaseToken(token);
  if (!payload) return NextResponse.json([], { status: 401 });

  const user = await findOne<AirtableUser>(Tables.Users, `{firebaseUid} = "${payload.uid}"`);
  if (!user) return NextResponse.json([]);

  const galleries = await findAll<AirtableClientGallery>(Tables.ClientGalleries, {
    filterFormula: `{userId} = "${user.id}"`,
    sort: [{ field: "createdAt", direction: "desc" }],
  });

  return NextResponse.json(galleries);
}
