"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { REACTIONS } from "../lib/events";
import { tapHaptic } from "../lib/haptics";
import type { ReactionCode } from "../hooks/useReactions";

/**
 * Meet's reaction bar: a row of emoji above the controls that stays open
 * while you send as many as you like, until you close it.
 */
export const ReactionBar = memo(function ReactionBar({
  open,
  onReact,
  onClose,
}: {
  open: boolean;
  onReact: (code: ReactionCode) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="pointer-events-auto mx-auto flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-[#1b2234] p-1.5 shadow-2xl [scrollbar-width:none]">
      {REACTIONS.map((r) => (
        <button
          key={r.code}
          type="button"
          aria-label={r.label}
          onClick={() => {
            tapHaptic(8);
            onReact(r.code);
          }}
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-[1.65rem] transition hover:bg-white/10 active:scale-125"
        >
          {r.emoji}
        </button>
      ))}
      <span className="mx-1 h-6 w-px shrink-0 bg-white/15" />
      <button
        type="button"
        aria-label="Close reactions"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
});
