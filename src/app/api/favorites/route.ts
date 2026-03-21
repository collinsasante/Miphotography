import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebase-verify";
import { findOne, create, destroy, Tables } from "@/lib/airtable";
import type { AirtableUser, AirtableClientGallery, AirtableFavorite } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const payload = await verifyFirebaseToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const user = await findOne<AirtableUser>(Tables.Users, `{firebaseUid} = "${payload.uid}"`);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { imageId, galleryId } = await req.json();
  if (!imageId || !galleryId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify gallery ownership
  const gallery = await findOne<AirtableClientGallery>(Tables.ClientGalleries, `RECORD_ID() = "${galleryId}"`);
  const ownerId = Array.isArray(gallery?.userId) ? gallery!.userId[0] : gallery?.userId;
  if (!gallery || (ownerId !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Toggle
  const existing = await findOne<AirtableFavorite>(
    Tables.Favorites,
    `AND({userId} = "${user.id}", {imageId} = "${imageId}")`
  );

  if (existing) {
    await destroy(Tables.Favorites, existing.id);
    return NextResponse.json({ favorited: false });
  }

  await create(Tables.Favorites, {
    userId:    [user.id],
    imageId:   [imageId],
    galleryId: [galleryId],
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ favorited: true });
}
