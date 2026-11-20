"use client";

import type { Choice } from "../questions";
import { tap } from "../haptics";

/** One answer from a short list, as large rows (a tap picks it and moves on). */
export function ChoiceList({
  choices,
  value,
  onChange,
  label,
}: {
  choices: Choice[];
  value?: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="space-y-2.5">
      {choices.map((choice, i) => {
        const selected = value === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              tap(10);
              onChange(choice.value);
            }}
            className={`flex min-h-[64px] w-full touch-manipulation items-center gap-4 rounded-2xl px-5 py-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] motion-reduce:transform-none ${
              selected ? "bg-primary text-white" : "bg-white/[0.06] text-white hover:bg-white/[0.1]"
            }`}
          >
            <span
              aria-hidden
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                selected ? "bg-white text-primary" : "bg-white/10 text-white/60"
              }`}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{choice.label}</span>
              {choice.hint && <span className={`block text-xs ${selected ? "text-white/80" : "text-white/50"}`}>{choice.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
