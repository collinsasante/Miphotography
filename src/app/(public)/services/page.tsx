import { Metadata } from "next";
import { findAll, Tables } from "@/lib/airtable";
import type { AirtablePackage } from "@/lib/airtable";
import { PackageCard } from "@/components/marketing/PackageCard";
import { Check } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Services & Packages",
  description: "Photography packages for every occasion. Transparent pricing, no hidden fees.",
};

const PROCESS = [
  { step: "01", title: "Inquiry", desc: "Fill out the booking form or send a message. I'll respond within 24 hours." },
  { step: "02", title: "Consultation", desc: "We'll connect to discuss your vision, timeline, location, and any details." },
  { step: "03", title: "The Session", desc: "Relax and be yourself. I'll guide you through every moment." },
  { step: "04", title: "Delivery", desc: "Edited photos delivered to your private gallery within the agreed timeframe." },
];

const FAQS = [
  { q: "How many photos will I receive?", a: "This depends on the package and session. Each package listing includes an estimated minimum. I always deliver more rather than fewer." },
  { q: "When will I receive my photos?", a: "Standard turnaround is 2–3 weeks. Rush delivery is available upon request." },
  { q: "Do you travel for sessions?", a: "Yes. Travel within 50 miles is included. Beyond that, travel costs are discussed upfront." },
  { q: "What's your payment policy?", a: "A 50% retainer is due upon booking to hold your date. The remaining balance is due 1 week before the session." },
  { q: "Can I see how to pay?", a: "Bank transfer details are provided with your booking confirmation. No hidden fees or processing charges." },
];

export default async function ServicesPage() {
  const packages = await findAll<AirtablePackage>(Tables.Packages, {
    filterFormula: "{isActive} = 1",
    sort: [{ field: "sortOrder", direction: "asc" }],
  });

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="text-center py-16 px-4">
        <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Pricing</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A18] mb-6">Services & Packages</h1>
        <p className="text-[#6B6860] max-w-md mx-auto leading-relaxed">
          Every package includes fully edited, high-resolution images delivered through your secure private gallery.
        </p>
      </div>

      {/* Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} featured={i === 1} index={i} />
          ))}
        </div>
      </section>

      {/* What's always included */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#1A1A18]">Always Included</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Private online gallery",
              "Full resolution downloads",
              "Professional editing",
              "Colour & light correction",
              "Online favourites selection",
              "Secure gallery delivery",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 py-3 border-b border-[#E8E4DF]">
                <Check size={14} className="text-[#C4A882] flex-shrink-0" />
                <span className="text-sm text-[#1A1A18]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Process</p>
          <h2 className="font-serif text-3xl text-[#1A1A18]">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROCESS.map(({ step, title, desc }) => (
            <div key={step}>
              <span className="font-serif text-4xl text-[#C4A882]/30">{step}</span>
              <h3 className="font-serif text-xl text-[#1A1A18] mt-4 mb-3">{title}</h3>
              <p className="text-sm text-[#6B6860] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-[#1A1A18]">Frequently Asked</h2>
        </div>
        <div className="space-y-6">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="border-b border-[#E8E4DF] pb-6">
              <h3 className="font-medium text-[#1A1A18] mb-2">{q}</h3>
              <p className="text-sm text-[#6B6860] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
