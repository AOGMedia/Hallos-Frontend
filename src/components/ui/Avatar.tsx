"use client";

import { useState } from "react";

interface AvatarProps {
  /** Profile picture URL. Missing, empty or failing to load => the person's initial. */
  src?: string | null;
  /** The person's name: used for the initial, its colour and the alt text. */
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

/** Google-Meet-like palette for initials; each name always gets the same colour. */
const COLORS = ["#7C5CFC", "#E5579F", "#1E88E5", "#00897B", "#F4511E", "#8E24AA", "#43A047", "#FB8C00", "#3949AB", "#D81B60"];

export function initialOf(name?: string | null): string {
  const letter = (name || "").trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}

export function colorFor(name?: string | null): string {
  const s = (name || "").trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

/** Paths from local uploads are served by the API, not the frontend. */
export function resolveAvatarUrl(src?: string | null): string | null {
  const value = (src || "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/upload")) {
    const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    return api ? `${api}${value}` : value;
  }
  return value;
}

/**
 * A person's profile picture, or — like Google Meet — the first letter of
 * their name on a colour of its own when there's no picture or it can't load.
 * Uses a plain <img>, so pictures from any host (our storage, legacy S3)
 * render without image-domain configuration.
 */
export function Avatar({ src, alt = "", size = "md", className = "" }: AvatarProps) {
  const url = resolveAvatarUrl(src);
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = url && failed !== url;

  return (
    <div
      className={`${SIZES[size]} shrink-0 overflow-hidden rounded-full flex items-center justify-center font-semibold text-white select-none ${className}`}
      style={showImage ? undefined : { backgroundColor: colorFor(alt) }}
      aria-label={alt || undefined}
      role="img"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- user pictures from several hosts; see doc above
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailed(url)}
        />
      ) : (
        <span aria-hidden>{initialOf(alt)}</span>
      )}
    </div>
  );
}
