"use client";

import { memo } from "react";
import { Hand } from "lucide-react";

/** Meet-style animated bars while someone is talking (CSS-only animation). */
export const SpeakingBars = memo(function SpeakingBars({ className = "" }: { className?: string }) {
  return (
    <span className={`hallos-bars inline-flex h-3.5 items-center gap-[2px] ${className}`} aria-label="Speaking">
      <span />
      <span />
      <span />
    </span>
  );
});

/** Signal-strength bars, shown only when a connection is weak. */
export const ConnectionBars = memo(function ConnectionBars({ level }: { level: 1 | 2 | 3 }) {
  const color = level === 1 ? "bg-red-400" : level === 2 ? "bg-amber-300" : "bg-emerald-400";
  return (
    <span className="inline-flex h-3 items-end gap-[2px]" aria-label={level === 1 ? "Weak connection" : "Connection"}>
      {[1, 2, 3].map((bar) => (
        <span key={bar} className={`w-[3px] rounded-sm ${bar <= level ? color : "bg-white/30"}`} style={{ height: `${bar * 4}px` }} />
      ))}
    </span>
  );
});

/** Raised hand with its place in line; waves when it goes up, like Meet. */
export const HandBadge = memo(function HandBadge({ position, className = "" }: { position: number; className?: string }) {
  return (
    <span
      className={`flex h-8 items-center gap-1 rounded-full bg-amber-400 px-2.5 text-xs font-bold text-black shadow-lg ${className}`}
      aria-label={`Hand raised, number ${position} in line`}
    >
      <Hand className="hallos-wave h-4 w-4" />
      {position}
    </span>
  );
});
