import { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { ALL_BOOKABLE_PACKAGES } from "@/lib/data/packages";

export const metadata: Metadata = {
  title: "Book a Session",
  description: "Reserve your photography session. Fill out the form and we'll be in touch within 24 hours.",
};

interface Props {
  searchParams: Promise<{ package?: string }>;
}

export default async function BookingPage({ searchParams }: Props) {
  const { package: packageId } = await searchParams;

  const packages = ALL_BOOKABLE_PACKAGES;

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Get Started</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A18]">Book a Session</h1>
          <p className="text-[#6B6860] mt-4 max-w-md mx-auto leading-relaxed">
            Fill out the form below and I&apos;ll be in touch within 24 hours to confirm your date.
          </p>
        </div>
        <BookingForm packages={packages} preselectedPackageId={packageId} />
      </div>
    </div>
  );
}
