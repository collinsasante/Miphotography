"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AirtablePackage } from "@/lib/airtable";

interface PackageCardProps {
  pkg: AirtablePackage;
  featured?: boolean;
  index?: number;
}

export function PackageCard({ pkg, featured = false, index = 0 }: PackageCardProps) {
  const inclusions = pkg.includes.split("\n").filter(Boolean);
  const hours = Math.floor(pkg.duration / 60);
  const mins  = pkg.duration % 60;
  const durationLabel = hours
    ? `${hours}h${mins ? ` ${mins}m` : ""}`
    : `${mins}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex flex-col p-8 border transition-shadow hover:shadow-lg ${
        featured
          ? "border-[#C4A882] bg-[#1A1A18] text-white"
          : "border-[#E8E4DF] bg-white text-[#1A1A18]"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4A882] text-white text-[10px] tracking-widest uppercase px-4 py-1">
          Most Popular
        </span>
      )}

      <div className="mb-6">
        <p className={`text-[10px] tracking-widest uppercase mb-2 ${featured ? "text-[#C4A882]" : "text-[#6B6860]"}`}>
          {durationLabel}
        </p>
        <h3 className="font-serif text-2xl mb-1">{pkg.name}</h3>
        <p className={`text-4xl font-light mt-4 ${featured ? "text-[#C4A882]" : "text-[#1A1A18]"}`}>
          {formatCurrency(pkg.price)}
        </p>
      </div>

      <p className={`text-sm leading-relaxed mb-6 ${featured ? "text-white/70" : "text-[#6B6860]"}`}>
        {pkg.description}
      </p>

      <ul className="flex-1 space-y-3 mb-8">
        {inclusions.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <Check size={14} className={`mt-0.5 flex-shrink-0 ${featured ? "text-[#C4A882]" : "text-[#C4A882]"}`} />
            <span className={featured ? "text-white/80" : "text-[#6B6860]"}>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/booking?package=${pkg.id}`}
        className={`text-center text-xs tracking-widest uppercase py-4 transition-colors ${
          featured
            ? "bg-[#C4A882] text-white hover:bg-[#8B7355]"
            : "border border-[#1A1A18] text-[#1A1A18] hover:bg-[#1A1A18] hover:text-white"
        }`}
      >
        Book This Package
      </Link>
    </motion.div>
  );
}
