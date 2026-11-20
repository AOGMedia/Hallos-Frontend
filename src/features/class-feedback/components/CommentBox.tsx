"use client";

import { useId } from "react";
import { EyeOff } from "lucide-react";
import { tap } from "../haptics";

const MAX = 2000;

/** The free-text answer, plus "send without my name" for participants. */
export function CommentBox({
  value,
  onChange,
  placeholder,
  note,
  allowAnonymous,
  anonymous,
  onAnonymous,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  note: string;
  allowAnonymous: boolean;
  anonymous: boolean;
  onAnonymous: (value: boolean) => void;
  label: string;
}) {
  const id = useId();
  const left = MAX - value.length;
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder={placeholder}
        rows={5}
        maxLength={MAX}
        className="block w-full resize-none rounded-2xl bg-white/[0.06] px-4 py-3.5 text-base leading-relaxed text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/35 focus:ring-2 focus:ring-primary"
      />
      <div className="mt-2 flex items-center justify-between px-1 text-xs text-white/45">
        <span>{allowAnonymous && anonymous ? "Your name won’t be shown." : note}</span>
        {left < 200 && <span aria-live="polite">{left} left</span>}
      </div>

      {allowAnonymous && (
        <button
          type="button"
          role="switch"
          aria-checked={anonymous}
          onClick={() => {
            tap(8);
            onAnonymous(!anonymous);
          }}
          className="mt-4 flex min-h-14 w-full touch-manipulation items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-left outline-none transition hover:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-primary"
        >
          <EyeOff className="h-4 w-4 shrink-0 text-white/60" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">Send without my name</span>
            <span className="block text-xs text-white/50">The host sees your feedback, not who sent it.</span>
          </span>
          <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${anonymous ? "bg-primary" : "bg-white/20"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${anonymous ? "translate-x-6" : "translate-x-1"}`} />
          </span>
        </button>
      )}
    </div>
  );
}
