"use client";

import { Check } from "lucide-react";
import type { Choice } from "../questions";
import { tap } from "../haptics";

/** Several answers at once, as chips. */
export function IssueChips({
  choices,
  value,
  onChange,
  label,
  exclusive,
}: {
  choices: Choice[];
  value: string[];
  /** Gets the new list from the current one (safe even for very quick taps). */
  onChange: (update: (current: string[]) => string[]) => void;
  label: string;
  /** A choice that clears the others (and is cleared by them), e.g. "Nothing". */
  exclusive?: string;
}) {
  const toggle = (v: string) => {
    tap(8);
    onChange((current) => {
      if (current.includes(v)) return current.filter((x) => x !== v);
      if (v === exclusive) return [v];
      return [...current.filter((x) => x !== exclusive), v];
    });
  };
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2.5">
      {choices.map((choice) => {
        const on = value.includes(choice.value);
        return (
          <button
            key={choice.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(choice.value)}
            className={`inline-flex min-h-12 touch-manipulation items-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] motion-reduce:transform-none ${
              on ? "bg-primary text-white" : "bg-white/[0.06] text-white/85 ring-1 ring-white/10 hover:bg-white/[0.1]"
            }`}
          >
            {on && <Check className="h-4 w-4" aria-hidden />}
            {choice.label}
          </button>
        );
      })}
    </div>
  );
}
