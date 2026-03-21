"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="font-serif text-6xl text-[#C4A882] mb-4">!</p>
        <h1 className="font-serif text-2xl text-[#1A1A18] mb-4">Something went wrong</h1>
        <p className="text-[#6B6860] mb-8 text-sm">An unexpected error occurred.</p>
        <button onClick={reset} className="text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A18] text-white hover:bg-[#C4A882] transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
