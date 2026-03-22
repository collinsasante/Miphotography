import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="font-serif text-5xl sm:text-6xl text-[#C4A882] mb-4">404</p>
        <h1 className="font-serif text-2xl text-[#1A1A18] mb-4">Page not found</h1>
        <p className="text-[#6B6860] mb-8 text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A18] text-white hover:bg-[#C4A882] transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}
