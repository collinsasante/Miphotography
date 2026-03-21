export type Role = "admin" | "client";
export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type GalleryStatus = "Processing" | "Ready" | "Archived";
export type InquiryStatus = "New" | "Read" | "Replied" | "Archived";
export type InquiryType  = "General" | "Booking" | "Pricing" | "Gallery";

export interface SessionUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  role: Role;
  airtableId: string;
}
