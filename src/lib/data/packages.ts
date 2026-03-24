export type PackageCategory = "photo-only" | "photo-video" | "extras" | "backdrops";

export interface StaticPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Price in pesewas (GHC × 100) */
  price: number;
  /** Duration in minutes */
  duration: number;
  /** Newline-separated list of inclusions */
  includes: string;
  isActive: boolean;
  sortOrder: number;
  category: PackageCategory;
}

// ─── Photo Only ───────────────────────────────────────────────────────────────

export const PHOTO_ONLY_PACKAGES: StaticPackage[] = [
  {
    id: "amamre",
    name: "Amamre",
    slug: "amamre",
    category: "photo-only",
    price: 400000,
    duration: 240,
    description: "Essential wedding photography coverage for intimate ceremonies.",
    includes: "1 photographer\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "akwaaba",
    name: "Akwaaba",
    slug: "akwaaba",
    category: "photo-only",
    price: 500000,
    duration: 300,
    description: "Warm and complete coverage to welcome every precious moment.",
    includes: "1 photographer\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "prime",
    name: "Prime",
    slug: "prime",
    category: "photo-only",
    price: 500000,
    duration: 300,
    description: "Prime-level coverage for your most important day.",
    includes: "1 photographer\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "awareso",
    name: "Awareso",
    slug: "awareso",
    category: "photo-only",
    price: 600000,
    duration: 360,
    description: "Comprehensive coverage capturing every cherished detail.",
    includes: "1 photographer\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "odo-yewu",
    name: "Odo Yewu",
    slug: "odo-yewu",
    category: "photo-only",
    price: 750000,
    duration: 420,
    description: "Deep, heartfelt coverage for love that deserves every frame.",
    includes: "1 photographer\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "mega",
    name: "Mega",
    slug: "mega",
    category: "photo-only",
    price: 850000,
    duration: 480,
    description: "Extended event coverage for grand celebrations.",
    includes: "Extended event coverage\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "grande",
    name: "Grande",
    slug: "grande",
    category: "photo-only",
    price: 1000000,
    duration: 480,
    description: "Full premium photo coverage.",
    includes: "Full premium photo coverage\nEdited high-resolution images\nOnline delivery",
    isActive: true,
    sortOrder: 7,
  },
];

// ─── Photo + Video ────────────────────────────────────────────────────────────

export const PHOTO_VIDEO_PACKAGES: StaticPackage[] = [
  {
    id: "miphoto",
    name: "MIPHOTO",
    slug: "miphoto",
    category: "photo-video",
    price: 750000,
    duration: 360,
    description: "Photo and video coverage for a single event.",
    includes: "Edited photos\nHighlight video\nOnline delivery",
    isActive: true,
    sortOrder: 8,
  },
  {
    id: "deluxe",
    name: "Deluxe",
    slug: "deluxe",
    category: "photo-video",
    price: 850000,
    duration: 480,
    description: "Photo and video coverage with a cinematic touch.",
    includes: "Edited photos\nHighlight video\nOnline delivery",
    isActive: true,
    sortOrder: 9,
  },
  {
    id: "love-is-here",
    name: "Love Is Here",
    slug: "love-is-here",
    category: "photo-video",
    price: 1100000,
    duration: 600,
    description: "Full photo and video coverage.",
    includes: "Edited photos\nCinematic highlight video\nOnline delivery",
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "premium",
    name: "Premium",
    slug: "premium",
    category: "photo-video",
    price: 1500000,
    duration: 720,
    description: "Our most complete package, full delivery package.",
    includes: "Edited photos\nCinematic highlight video\nFull delivery package",
    isActive: true,
    sortOrder: 11,
  },
];

// ─── Extras ───────────────────────────────────────────────────────────────────

export interface ExtraItem {
  id: string;
  name: string;
  price: number; // in pesewas
  note?: string;
}

export const EXTRAS: ExtraItem[] = [
  { id: "extra-photographer", name: "Extra Photographer", price: 120000 },
  { id: "prewedding-2looks", name: "Pre-wedding / Post-wedding Shoot (2 looks, photos only)", price: 150000 },
  { id: "prewedding-3looks", name: "Pre-wedding / Post-wedding Shoot (3 looks, photos only)", price: 250000 },
  { id: "drone-1day", name: "Drone Coverage, 1 day", price: 100000 },
  { id: "drone-2days", name: "Drone Coverage, 2 days", price: 180000 },
];

// ─── Canvas Backdrops ─────────────────────────────────────────────────────────

export interface BackdropItem {
  id: string;
  name: string;
  price: number; // in pesewas, per day incl. transport
}

export const BACKDROPS: BackdropItem[] = [
  { id: "dakota", name: "Dakota", price: 220000 },
  { id: "mocha", name: "Mocha", price: 200000 },
  { id: "kol", name: "Kol", price: 200000 },
];

// ─── All bookable packages (for booking form) ─────────────────────────────────

export const ALL_BOOKABLE_PACKAGES: StaticPackage[] = [
  ...PHOTO_ONLY_PACKAGES,
  ...PHOTO_VIDEO_PACKAGES,
];
