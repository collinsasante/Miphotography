"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services",  label: "Services" },
  { href: "/about",     label: "About" },
  { href: "/contact",   label: "Contact" },
];

export function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname                = usePathname();
  const { sessionUser, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const isHome      = pathname === "/";
  const transparent = !scrolled && isHome;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-[#E8E4DF]"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-36 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center h-10">
          <Image
            src="/logo.png"
            alt="Miphotography"
            width={500}
            height={120}
            className={cn(
              "object-contain h-32 w-auto transition-all duration-300",
              transparent ? "" : "invert"
            )}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "text-xs tracking-widest uppercase transition-colors hover:text-[#C4A882]",
                  pathname === href
                    ? "text-[#C4A882]"
                    : transparent ? "text-white" : "text-[#1A1A18]"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-4">
          {sessionUser ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "text-xs tracking-widest uppercase transition-colors hover:text-[#C4A882]",
                    transparent ? "text-white" : "text-[#1A1A18]"
                  )}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/client"
                className="text-xs tracking-widest uppercase px-4 py-2 border border-[#C4A882] text-[#C4A882] hover:bg-[#C4A882] hover:text-white transition-colors"
              >
                My Gallery
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "text-xs tracking-widest uppercase transition-colors hover:text-[#C4A882]",
                  transparent ? "text-white" : "text-[#1A1A18]"
                )}
              >
                Client Login
              </Link>
              <Link
                href="/booking"
                className="text-xs tracking-widest uppercase px-4 py-2 bg-[#C4A882] text-white hover:bg-[#8B7355] transition-colors"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "md:hidden p-2 transition-colors",
            transparent ? "text-white" : "text-[#1A1A18]"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#FAFAF9] border-t border-[#E8E4DF] px-4 py-6 space-y-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block text-xs tracking-widest uppercase text-[#1A1A18] hover:text-[#C4A882] transition-colors py-2"
            >
              {label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#E8E4DF] space-y-3">
            {sessionUser ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="block text-xs tracking-widest uppercase text-[#1A1A18] hover:text-[#C4A882] py-2">
                    Admin
                  </Link>
                )}
                <Link href="/client" className="block text-xs tracking-widest uppercase text-center py-3 border border-[#C4A882] text-[#C4A882]">
                  My Gallery
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-xs tracking-widest uppercase text-[#1A1A18] hover:text-[#C4A882] py-2">
                  Client Login
                </Link>
                <Link href="/booking" className="block text-xs tracking-widest uppercase text-center py-3 bg-[#C4A882] text-white">
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
