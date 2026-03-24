"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, Camera } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { sessionUser, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !sessionUser) {
      router.replace("/login?next=/client");
    }
  }, [loading, sessionUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessionUser) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Client header */}
      <header className="bg-white border-b border-[#E8E4DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif text-[#1A1A18]">
            <Camera size={16} className="text-[#C4A882]" />
            Miphotographer
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B6860]">{sessionUser.name ?? sessionUser.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
