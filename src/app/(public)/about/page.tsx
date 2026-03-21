import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "The person behind the lens. Learn about my approach, philosophy, and story.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-[#E8E4DF]">
            {/* Replace src with your actual photo */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#C4A882]/20 to-[#1A1A18]/10 flex items-center justify-center">
              <p className="text-[#6B6860] text-sm">Photographer portrait</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-4">About</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A18] mb-8 leading-tight">
              The person behind the lens
            </h1>
            <div className="space-y-5 text-[#6B6860] leading-relaxed">
              <p>
                I&apos;m Miphotography — a professional photographer based in [City], specialising in weddings, portraits, and commercial work. My style blends editorial precision with warmth and authenticity.
              </p>
              <p>
                I believe great photography isn&apos;t just about technical skill — it&apos;s about connection. The moments I treasure most are the ones my clients never saw coming: a laugh that caught them off guard, a stolen glance between partners, a child discovering something magical.
              </p>
              <p>
                Every session I approach as a collaboration. My job is to create an environment where you feel comfortable, confident, and completely yourself — so the images feel real, not performed.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#E8E4DF] pt-10">
              {[
                { num: "8+", label: "Years experience" },
                { num: "300+", label: "Sessions completed" },
                { num: "100%", label: "Client satisfaction" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p className="font-serif text-3xl text-[#C4A882]">{num}</p>
                  <p className="text-xs text-[#6B6860] mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex gap-4">
              <Link href="/booking" className="px-6 py-3 bg-[#C4A882] text-white text-xs tracking-widest uppercase hover:bg-[#8B7355] transition-colors">
                Work with me
              </Link>
              <Link href="/portfolio" className="px-6 py-3 border border-[#E8E4DF] text-[#1A1A18] text-xs tracking-widest uppercase hover:border-[#1A1A18] transition-colors">
                View work
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <section className="bg-[#1A1A18] py-20 px-4 text-center my-16">
        <div className="max-w-2xl mx-auto">
          <p className="font-serif text-2xl sm:text-3xl text-white italic leading-relaxed">
            &ldquo;I don&apos;t capture moments. I capture the feeling between them.&rdquo;
          </p>
          <p className="text-[#C4A882] text-xs tracking-widest uppercase mt-6">— Miphotography</p>
        </div>
      </section>
    </div>
  );
}
