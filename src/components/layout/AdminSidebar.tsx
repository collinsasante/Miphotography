"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NextImage from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Image,
  Users,
  MessageSquare,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",             label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/bookings",    label: "Bookings",   icon: Calendar },
  { href: "/admin/galleries",   label: "Galleries",  icon: Image },
  { href: "/admin/clients",     label: "Clients",    icon: Users },
  { href: "/admin/inquiries",   label: "Inquiries",  icon: MessageSquare },
  { href: "/admin/content",     label: "Content",    icon: FileText },
  { href: "/admin/staff",       label: "Staff",      icon: ShieldCheck },
  { href: "/admin/settings",    label: "Settings",   icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center justify-center" onClick={onNavigate}>
          <NextImage
            src="/logo.png"
            alt="Miphotographer"
            width={160}
            height={48}
            className="object-contain h-12 w-auto"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
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
          onClick={() => { logout(); onNavigate?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-[#1A1A18] flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1A1A18] flex items-center justify-between px-4 h-14 border-b border-white/10">
        <NextImage
          src="/logo.png"
          alt="Miphotographer"
          width={100}
          height={30}
          className="object-contain h-8 w-auto"
        />
        <button
          onClick={() => setOpen(true)}
          className="text-white/70 hover:text-white p-2"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Drawer */}
          <aside
            className="relative w-64 max-w-[80vw] bg-[#1A1A18] h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
