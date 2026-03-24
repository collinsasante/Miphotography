import { Metadata } from "next";
import { PackageCard } from "@/components/marketing/PackageCard";
import { Check } from "lucide-react";
import { PHOTO_ONLY_PACKAGES, PHOTO_VIDEO_PACKAGES, EXTRAS, BACKDROPS } from "@/lib/data/packages";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services & Packages",
  description: "Photography packages for every occasion. Transparent pricing, no hidden fees.",
};

const PROCESS = [
  { step: "01", title: "Inquiry", desc: "Fill out the booking form or send a message. We'll respond within 24 hours." },
  { step: "02", title: "Consultation", desc: "We'll connect to discuss your vision, timeline, location, and any details." },
  { step: "03", title: "The Session", desc: "Relax and be yourself. We'll guide you through every moment." },
  { step: "04", title: "Delivery", desc: "Edited photos delivered to your private gallery within the agreed timeframe." },
];

const FAQS = [
  { q: "How many photos will I receive?", a: "This depends on the package and session length. Every package delivers fully edited, high-resolution images — we always deliver more rather than fewer." },
  { q: "When will I receive my photos?", a: "Standard turnaround is 2–3 weeks. Rush delivery is available upon request." },
  { q: "Do you travel for sessions?", a: "Yes. Travel within Accra is included. Beyond that, travel costs are discussed upfront." },
  { q: "What's your payment policy?", a: "A 50% retainer is due upon booking to hold your date. The remaining balance is due 1 week before the session." },
  { q: "How do I pay?", a: "We accept CalBank transfers, MTN Mobile Money, and Vodafone Cash. Full payment details are provided with your booking confirmation." },
];

export default function ServicesPage() {
  return (
    <div className="pt-24 sm:pt-36 md:pt-44 pb-16">
      {/* Header */}
      <div className="text-center py-16 px-4">
        <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Pricing</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A18] mb-6">Services & Packages</h1>
        <p className="text-[#6B6860] max-w-md mx-auto leading-relaxed">
          Every package includes fully edited, high-resolution images delivered through your secure private gallery.
        </p>
      </div>

      {/* Photo Only Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mb-10">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">Category</p>
          <h2 className="font-serif text-3xl text-[#1A1A18]">Photo Only</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PHOTO_ONLY_PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} featured={i === 3} index={i} />
          ))}
        </div>
      </section>

      {/* Photo + Video Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mb-10">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">Category</p>
          <h2 className="font-serif text-3xl text-[#1A1A18]">Photo + Video</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHOTO_VIDEO_PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} featured={i === 1} index={i} />
          ))}
        </div>
      </section>

      {/* Extras & Backdrops */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Extras */}
            <div>
              <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">Add-ons</p>
              <h2 className="font-serif text-2xl text-[#1A1A18] mb-8">Extras</h2>
              <div className="space-y-0">
                {EXTRAS.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-4 border-b border-[#E8E4DF] gap-4">
                    <span className="text-sm text-[#1A1A18] leading-relaxed">{item.name}</span>
                    <span className="text-sm font-medium text-[#C4A882] whitespace-nowrap flex-shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas Backdrops */}
            <div>
              <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">Rentals</p>
              <h2 className="font-serif text-2xl text-[#1A1A18] mb-8">Canvas Backdrops</h2>
              <div className="space-y-0">
                {BACKDROPS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4 border-b border-[#E8E4DF]">
                    <span className="text-sm text-[#1A1A18]">{item.name}</span>
                    <span className="text-sm font-medium text-[#C4A882]">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B6860] mt-4 leading-relaxed">
                All backdrop prices are per day and include transportation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Details */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Payment</p>
          <h2 className="font-serif text-3xl text-[#1A1A18]">How to Pay</h2>
          <p className="text-[#6B6860] text-sm mt-4 leading-relaxed max-w-md mx-auto">
            A 50% retainer secures your date. The remaining balance is due 1 week before the session.
            No hidden fees or processing charges.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { method: "CalBank", detail: "1400008198359" },
            { method: "MTN Mobile Money", detail: "0538523381" },
            { method: "Vodafone Cash", detail: "0205859006" },
          ].map(({ method, detail }) => (
            <div key={method} className="border border-[#E8E4DF] p-6 text-center">
              <p className="text-[10px] tracking-widest uppercase text-[#6B6860] mb-2">{method}</p>
              <p className="font-medium text-[#1A1A18] text-lg">{detail}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[#6B6860] mt-6">
          Account name: <span className="text-[#1A1A18] font-medium">Emmanuel Kissiedu</span>
        </p>
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
