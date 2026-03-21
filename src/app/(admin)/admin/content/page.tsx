import { findAll, Tables } from "@/lib/airtable";
import type { AirtablePackage, AirtableTestimonial, AirtableAvailability } from "@/lib/airtable";
import { ContentManager } from "./ContentManager";

export const revalidate = 0;

export default async function AdminContentPage() {
  const [packages, testimonials, availability] = await Promise.all([
    findAll<AirtablePackage>(Tables.Packages, { sort: [{ field: "sortOrder", direction: "asc" }] }),
    findAll<AirtableTestimonial>(Tables.Testimonials, { sort: [{ field: "sortOrder", direction: "asc" }] }),
    findAll<AirtableAvailability>(Tables.Availability, { sort: [{ field: "startDate", direction: "asc" }] }),
  ]);

  return (
    <ContentManager
      initialPackages={packages}
      initialTestimonials={testimonials}
      initialAvailability={availability}
    />
  );
}
