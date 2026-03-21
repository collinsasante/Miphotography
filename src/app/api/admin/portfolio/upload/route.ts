import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { create, Tables } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData  = await req.formData();
  const file      = formData.get("file") as File | null;
  const galleryId = formData.get("galleryId") as string | null;
  if (!file || !galleryId) {
    return NextResponse.json({ error: "Missing file or galleryId" }, { status: 400 });
  }

  if (!/^rec[A-Za-z0-9]{14}$/.test(galleryId)) {
    return NextResponse.json({ error: "Invalid galleryId" }, { status: 400 });
  }

  try {
    const result = await uploadToCloudinary(file, `portfolio/${galleryId}`);
    await create(Tables.PortfolioImages, {
      galleryId:    [galleryId],
      cloudinaryId: result.public_id,
      url:          result.secure_url,
      width:        result.width,
      height:       result.height,
      sortOrder:    Date.now(),
    });
    return NextResponse.json({ success: true, publicId: result.public_id, url: result.secure_url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
