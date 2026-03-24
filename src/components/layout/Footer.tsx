import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1A1A18] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center h-8 mb-4">
              <Image
                src="/logo.png"
                alt="Miphotographer"
                width={140}
                height={35}
                className="object-contain h-28 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Premium photography for life&apos;s most meaningful moments.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[#C4A882] transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:Kissirichsmanuel3@gmail.com"
                aria-label="Email"
                className="hover:text-[#C4A882] transition-colors"
              >
                <Mail size={18} />
              </a>
              <a
                href="tel:+233538523381"
                aria-label="Phone"
                className="hover:text-[#C4A882] transition-colors"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-white mb-4">Navigation</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/portfolio", label: "Portfolio" },
                { href: "/services",  label: "Services" },
                { href: "/about",     label: "About" },
                { href: "/booking",   label: "Book a Session" },
                { href: "/contact",   label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#C4A882] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:Kissirichsmanuel3@gmail.com" className="hover:text-[#C4A882] transition-colors break-all">
                  Kissirichsmanuel3@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+233538523381" className="hover:text-[#C4A882] transition-colors">0538523381</a>
              </li>
              <li>
                <a href="tel:+233205859006" className="hover:text-[#C4A882] transition-colors">0205859006</a>
              </li>
              <li className="pt-2 border-t border-white/10">
                <Link href="/login" className="hover:text-[#C4A882] transition-colors">Client Login</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Miphotographer. All rights reserved.</p>
          <p className="text-[#C4A882]">Capturing moments that matter.</p>
        </div>
      </div>
    </footer>
  );
}
