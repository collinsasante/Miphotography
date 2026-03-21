import Airtable from "airtable";

// Lazy initialization — avoids crash when env vars aren't set at build time
let _base: ReturnType<InstanceType<typeof Airtable>["base"]> | null = null;

function getBase() {
  if (!_base) {
    const key = process.env.AIRTABLE_API_KEY;
    if (!key) {
      // Build-time: return null so callers can return empty data gracefully
      return null;
    }
    _base = new Airtable({ apiKey: key }).base(process.env.AIRTABLE_BASE_ID!);
  }
  return _base;
}


// ─── Table names ─────────────────────────────────────────
export const Tables = {
  Users:              "Users",
  Bookings:           "Bookings",
  Packages:           "Packages",
  PortfolioGalleries: "Portfolio Galleries",
  PortfolioImages:    "Portfolio Images",
  ClientGalleries:    "Client Galleries",
  GalleryImages:      "Gallery Images",
  Favorites:          "Favorites",
  Inquiries:          "Inquiries",
  Testimonials:       "Testimonials",
  Availability:       "Availability",
  Settings:           "Settings",
} as const;

// ─── Types ────────────────────────────────────────────────

export interface AirtableUser {
  id: string;
  firebaseUid: string;
  email: string;
  name?: string;
  role: "admin" | "client";
  avatarUrl?: string;
  createdAt: string;
}

export interface AirtablePackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  duration: number; // minutes
  includes: string; // newline-separated list
  isActive: boolean;
  sortOrder: number;
}

export interface AirtableBooking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  packageId?: string[];
  packageName?: string;
  sessionDate?: string;
  sessionType?: string;
  location?: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes?: string;
  calendarEventId?: string;
  createdAt: string;
}

export interface AirtableInquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: "General" | "Booking" | "Pricing" | "Gallery";
  status: "New" | "Read" | "Replied" | "Archived";
  createdAt: string;
}

export interface AirtablePortfolioGallery {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  coverImageUrl: string;
  coverPublicId: string;
  isPublished: boolean;
  sortOrder: number;
  shootDate?: string;
  location?: string;
}

export interface AirtablePortfolioImage {
  id: string;
  galleryId: string[];
  cloudinaryId: string;
  url: string;
  width: number;
  height: number;
  alt?: string;
  sortOrder: number;
}

export interface AirtableClientGallery {
  id: string;
  userId: string[];  // linked to Users
  title: string;
  slug: string;
  description?: string;
  coverPublicId?: string;
  status: "Processing" | "Ready" | "Archived";
  downloadEnabled: boolean;
  watermarkEnabled: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface AirtableGalleryImage {
  id: string;
  galleryId: string[];
  cloudinaryId: string;
  url: string;
  width: number;
  height: number;
  alt?: string;
  sortOrder: number;
}

export interface AirtableFavorite {
  id: string;
  userId: string[];
  imageId: string[];
  galleryId: string[];
  createdAt: string;
}

export interface AirtableTestimonial {
  id: string;
  clientName: string;
  clientTitle?: string;
  body: string;
  rating: number;
  avatarUrl?: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface AirtableAvailability {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface AirtableSettings {
  id: string;
  photographerName?: string;
  tagline?: string;
  bio?: string;
  contactEmail?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  notificationEmail?: string;
  bookingIntro?: string;
}

// ─── Generic helpers ──────────────────────────────────────

type RecordFields = Record<string, unknown>;

export async function findAll<T>(
  tableName: string,
  opts: { filterFormula?: string; sort?: { field: string; direction?: "asc" | "desc" }[]; maxRecords?: number } = {}
): Promise<T[]> {
  const b = getBase();
  if (!b) return []; // build-time fallback: no credentials

  const records = await b(tableName)
    .select({
      filterByFormula: opts.filterFormula ?? "",
      sort: opts.sort ?? [],
      ...(opts.maxRecords !== undefined && { maxRecords: opts.maxRecords }),
    })
    .all();

  return records.map((r) => ({ id: r.id, ...r.fields } as unknown as T));
}

export async function findById<T>(tableName: string, id: string): Promise<T | null> {
  const b = getBase();
  if (!b) return null;
  try {
    const record = await b(tableName).find(id);
    return { id: record.id, ...record.fields } as unknown as T;
  } catch {
    return null;
  }
}

export async function findOne<T>(
  tableName: string,
  filterFormula: string
): Promise<T | null> {
  const b = getBase();
  if (!b) return null;
  const records = await b(tableName)
    .select({ filterByFormula: filterFormula, maxRecords: 1 })
    .firstPage();
  if (!records.length) return null;
  return { id: records[0].id, ...records[0].fields } as unknown as T;
}

export async function create<T>(
  tableName: string,
  fields: RecordFields
): Promise<T> {
  const b = getBase();
  if (!b) throw new Error("AIRTABLE_API_KEY is not set");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (b(tableName) as any).create(fields);
  return { id: record.id, ...record.fields } as unknown as T;
}

export async function update<T>(
  tableName: string,
  id: string,
  fields: RecordFields
): Promise<T> {
  const b = getBase();
  if (!b) throw new Error("AIRTABLE_API_KEY is not set");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (b(tableName) as any).update(id, fields);
  return { id: record.id, ...record.fields } as unknown as T;
}

export async function destroy(tableName: string, id: string): Promise<void> {
  const b = getBase();
  if (!b) throw new Error("AIRTABLE_API_KEY is not set");
  await b(tableName).destroy(id);
}

