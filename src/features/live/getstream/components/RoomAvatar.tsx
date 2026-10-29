"use client";

import { memo, useState } from "react";
import { colorFor, initialOf } from "@/components/ui/Avatar";

/**
 * A person's picture in the class, or — like Google Meet — the first letter
 * of their name on their own colour when there's no picture (or it fails).
 * Sizing comes from `className` so tiles can scale it with the tile.
 */
export const RoomAvatar = memo(function RoomAvatar({
  name,
  image,
  className = "h-8 w-8 text-[11px]",
  speaking = false,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
  /** Glowing ring while they talk (camera-off tiles). */
  speaking?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const src = image && /^https?:\/\//i.test(image) && failed !== image ? image : null;

  return (
    <div
      className={`relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white transition-shadow duration-200 ${
        speaking ? "shadow-[0_0_0_3px_rgba(124,92,252,0.9),0_0_24px_6px_rgba(124,92,252,0.45)]" : ""
      } ${className}`}
      style={src ? undefined : { backgroundColor: colorFor(name) }}
      role="img"
      aria-label={name || undefined}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- profile pictures from our storage
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailed(src)}
        />
      ) : (
        <span aria-hidden>{initialOf(name)}</span>
      )}
    </div>
  );
});
