"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NextImage from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Image,
  GalleryHorizontal,
  Users,
  MessageSquare,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",             label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/bookings",    label: "Bookings",   icon: Calendar },
  { href: "/admin/galleries",   label: "Galleries",  icon: Image },
  { href: "/admin/portfolio",   label: "Portfolio",  icon: GalleryHorizontal },
  { href: "/admin/clients",     label: "Clients",    icon: Users },
  { href: "/admin/inquiries",   label: "Inquiries",  icon: MessageSquare },
  { href: "/admin/content",     label: "Content",    icon: FileText },
  { href: "/admin/staff",       label: "Staff",      icon: ShieldCheck },
  { href: "/admin/settings",    label: "Settings",   icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-[#1A1A18] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center justify-center">
          <NextImage
            src="/logo.png"
            alt="Miphotography"
            width={160}
            height={48}
            className="object-contain h-12 w-auto"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors",
                active
                  ? "bg-[#C4A882]/20 text-[#C4A882]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
