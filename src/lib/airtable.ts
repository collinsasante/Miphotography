/**
 * Airtable REST API client.
 * Uses native fetch — fully compatible with Cloudflare Workers.
 * No Airtable SDK dependency.
 */

const BASE_URL = "https://api.airtable.com/v0";

function getCredentials() {
  const key    = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!key || !baseId) return null;
  return { key, baseId };
}

function headers(key: string) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
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
  userId: string[];
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

// ─── REST helpers ─────────────────────────────────────────

type RecordFields = Record<string, unknown>;

interface AirtableRecord {
  id: string;
  fields: RecordFields;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

function mapRecord<T>(r: AirtableRecord): T {
  return { id: r.id, ...r.fields } as unknown as T;
}

export async function findAll<T>(
  tableName: string,
  opts: {
    filterFormula?: string;
    sort?: { field: string; direction?: "asc" | "desc" }[];
    maxRecords?: number;
  } = {}
): Promise<T[]> {
  const creds = getCredentials();
  if (!creds) return [];

  const params = new URLSearchParams();
  if (opts.filterFormula) params.set("filterByFormula", opts.filterFormula);
  if (opts.maxRecords)   params.set("maxRecords", String(opts.maxRecords));
  opts.sort?.forEach((s, i) => {
    params.set(`sort[${i}][field]`, s.field);
    if (s.direction) params.set(`sort[${i}][direction]`, s.direction);
  });

  const all: T[] = [];
  let offset: string | undefined;

  do {
    if (offset) params.set("offset", offset);
    const url = `${BASE_URL}/${creds.baseId}/${encodeURIComponent(tableName)}?${params}`;
    const res = await fetch(url, { headers: headers(creds.key) });
    if (!res.ok) return all;
    const data = await res.json() as AirtableListResponse;
    all.push(...data.records.map(mapRecord<T>));
    offset = data.offset;
  } while (offset);

  return all;
}

export async function findById<T>(tableName: string, id: string): Promise<T | null> {
  const creds = getCredentials();
  if (!creds) return null;
  try {
    const url = `${BASE_URL}/${creds.baseId}/${encodeURIComponent(tableName)}/${id}`;
    const res = await fetch(url, { headers: headers(creds.key) });
    if (!res.ok) return null;
    const record = await res.json() as AirtableRecord;
    return mapRecord<T>(record);
  } catch {
    return null;
  }
}

export async function findOne<T>(tableName: string, filterFormula: string): Promise<T | null> {
  const creds = getCredentials();
  if (!creds) return null;
  const params = new URLSearchParams({ filterByFormula: filterFormula, maxRecords: "1" });
  const url = `${BASE_URL}/${creds.baseId}/${encodeURIComponent(tableName)}?${params}`;
  const res = await fetch(url, { headers: headers(creds.key) });
  if (!res.ok) return null;
  const data = await res.json() as AirtableListResponse;
  if (!data.records.length) return null;
  return mapRecord<T>(data.records[0]);
}

export async function create<T>(tableName: string, fields: RecordFields): Promise<T> {
  const creds = getCredentials();
  if (!creds) throw new Error("AIRTABLE_API_KEY is not set");
  const url = `${BASE_URL}/${creds.baseId}/${encodeURIComponent(tableName)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(creds.key),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Airtable create failed: ${res.status}`);
  const record = await res.json() as AirtableRecord;
  return mapRecord<T>(record);
}

export async function update<T>(tableName: string, id: string, fields: RecordFields): Promise<T> {
  const creds = getCredentials();
  if (!creds) throw new Error("AIRTABLE_API_KEY is not set");
  const url = `${BASE_URL}/${creds.baseId}/${encodeURIComponent(tableName)}/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: headers(creds.key),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Airtable update failed: ${res.status}`);
  const record = await res.json() as AirtableRecord;
  return mapRecord<T>(record);
}

export async function destroy(tableName: string, id: string): Promise<void> {
  const creds = getCredentials();
  if (!creds) throw new Error("AIRTABLE_API_KEY is not set");
  const url = `${BASE_URL}/${creds.baseId}/${encodeURIComponent(tableName)}/${id}`;
  const res = await fetch(url, { method: "DELETE", headers: headers(creds.key) });
  if (!res.ok) throw new Error(`Airtable delete failed: ${res.status}`);
}
