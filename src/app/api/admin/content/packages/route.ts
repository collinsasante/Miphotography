import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase-verify";
import { findAll, create, Tables } from "@/lib/airtable";
import type { AirtablePackage } from "@/lib/airtable";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const packages = await findAll<AirtablePackage>(Tables.Packages, { sort: [{ field: "sortOrder", direction: "asc" }] });
  return NextResponse.json(packages);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const pkg = await create<AirtablePackage>(Tables.Packages, {
    name:        body.name,
    slug:        (body.name as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    description: body.description ?? "",
    price:       body.price ?? 0,
    duration:    body.duration ?? 60,
    includes:    body.includes ?? "",
    isActive:    body.isActive ?? true,
    sortOrder:   body.sortOrder ?? 0,
  });
  return NextResponse.json(pkg);
}
