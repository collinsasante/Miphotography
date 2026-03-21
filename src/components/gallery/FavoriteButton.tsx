"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  imageId: string;
  galleryId: string;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
}

export function FavoriteButton({
  imageId,
  galleryId,
  initialFavorited = false,
  onToggle,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !favorited;
    setFavorited(next); // optimistic
    onToggle?.(next);

    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, galleryId }),
        });
        if (!res.ok) {
          setFavorited(!next); // revert
          onToggle?.(!next);
        }
      } catch {
        setFavorited(!next);
        onToggle?.(!next);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={cn(
        "p-2 rounded-full transition-all duration-200",
        favorited
          ? "bg-red-50 text-red-500 scale-110"
          : "bg-white/80 text-[#6B6860] hover:bg-red-50 hover:text-red-400",
        isPending && "opacity-60 cursor-wait"
      )}
    >
      <Heart
        size={16}
        className={cn("transition-all", favorited ? "fill-current" : "fill-none")}
      />
    </button>
  );
}
