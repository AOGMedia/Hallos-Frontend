"use client";

import { useEffect } from "react";
import { tap } from "../haptics";

/**
 * Five hand-drawn faces, from a frown to a big smile — line drawings in the
 * brand colour rather than emoji, so they look the same everywhere and feel
 * made for Hallos. The chosen face fills in; keys 1–5 work too.
 */

/** Mouth for each level (1 = unhappy … 5 = delighted), in a 48×48 box. */
const MOUTHS = [
  "M16 33 Q24 26 32 33", // frown
  "M17 32 Q24 29 31 32", // slight frown
  "M17 31 L31 31", // flat
  "M16 29 Q24 35 32 29", // smile
  "M14 28 Q24 39 34 28 Z", // big open smile
];

function Face({ level, selected }: { level: number; selected: boolean }) {
  const open = level === 5;
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <circle
        cx="24"
        cy="24"
        r="21"
        className={`transition-colors duration-200 ${selected ? "fill-primary stroke-primary" : "fill-transparent stroke-white/35"}`}
        strokeWidth="2"
      />
      {/* Eyes: happy faces squint a little. */}
      {level >= 4 ? (
        <>
          <path d="M15 19 Q18 16 21 19" className={selected ? "stroke-white" : "stroke-white/80"} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M27 19 Q30 16 33 19" className={selected ? "stroke-white" : "stroke-white/80"} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="18" cy="19" r="2.2" className={selected ? "fill-white" : "fill-white/80"} />
          <circle cx="30" cy="19" r="2.2" className={selected ? "fill-white" : "fill-white/80"} />
        </>
      )}
      <path
        d={MOUTHS[level - 1]}
        className={selected ? "stroke-white" : "stroke-white/80"}
        fill={open ? (selected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)") : "none"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RatingFaces({
  value,
  labels,
  onChange,
  label,
}: {
  value?: number;
  labels: [string, string, string, string, string];
  onChange: (value: number) => void;
  label: string;
}) {
  // Keys 1–5 pick a face (desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 5) onChange(n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChange]);

  return (
    <div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((level) => {
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${level} out of 5: ${labels[level - 1]}`}
              onClick={() => {
                tap(selected ? 6 : 12);
                onChange(level);
              }}
              className={`group flex touch-manipulation flex-col items-center gap-2 rounded-2xl py-2 outline-none transition focus-visible:ring-2 focus-visible:ring-primary ${
                selected ? "" : "opacity-85 hover:opacity-100"
              }`}
            >
              <span
                className={`block aspect-square w-full max-w-[64px] transition-transform duration-200 motion-reduce:transition-none ${
                  selected ? "scale-110" : "group-hover:-translate-y-0.5 group-active:scale-95"
                }`}
              >
                <Face level={level} selected={selected} />
              </span>
            </button>
          );
        })}
      </div>
      {/* The chosen face's word, or a hint before choosing. */}
      <p className="mt-4 h-6 text-center text-base font-semibold text-white" aria-live="polite">
        {value ? labels[value - 1] : <span className="font-normal text-white/45">Tap a face</span>}
      </p>
    </div>
  );
}
