"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/lib/cloudinary";
import { format } from "date-fns";
import type { AirtableClientGallery } from "@/lib/airtable";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Ready:      "bg-green-50 text-green-700",
    Processing: "bg-amber-50 text-amber-700",
    Archived:   "bg-[#F5F5F4] text-[#6B6860]",
  };
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 ${colors[status] ?? "bg-[#F5F5F4] text-[#6B6860]"}`}>
      {status}
    </span>
  );
}

export default function ClientDashboard() {
  const { sessionUser } = useAuth();
  const [galleries, setGalleries] = useState<AirtableClientGallery[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/client/galleries")
      .then((r) => r.json())
      .then(setGalleries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Welcome */}
      <div className="mb-12">
        <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-2">Client Portal</p>
        <h1 className="font-serif text-3xl text-[#1A1A18]">
          Welcome back{sessionUser?.name ? `, ${sessionUser.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-[#6B6860] text-sm mt-2">Your galleries and deliverables are below.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-video bg-[#E8E4DF] animate-pulse" />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#E8E4DF]">
          <p className="text-[#6B6860] text-sm mb-4">No galleries yet.</p>
          <p className="text-[#6B6860] text-xs">
            Your photos will appear here once your session has been delivered.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/client/gallery/${gallery.slug}`}
              className="group block border border-[#E8E4DF] hover:border-[#C4A882] transition-colors"
            >
              {/* Cover */}
              <div className="aspect-video bg-[#E8E4DF] relative overflow-hidden">
                {gallery.coverPublicId ? (
                  <Image
                    src={getImageUrl(gallery.coverPublicId, { width: 600 })}
                    alt={gallery.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#6B6860] text-xs tracking-widest uppercase">Processing</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-serif text-lg text-[#1A1A18] group-hover:text-[#C4A882] transition-colors">
                    {gallery.title}
                  </h2>
                  <StatusBadge status={gallery.status} />
                </div>
                <p className="text-xs text-[#6B6860] mt-1">
                  {format(new Date(gallery.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
