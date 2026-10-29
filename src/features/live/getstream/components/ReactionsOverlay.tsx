"use client";

import { memo, useEffect, useRef } from "react";
import { useFloatingReactions, type FloatingReaction, type ReactionBus } from "../hooks/useReactions";

/** One emoji drifting up and fading out (Web Animations API — no global CSS needed). */
function Floater({ reaction, durationMs }: { reaction: FloatingReaction; durationMs: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const drift = (reaction.lane - 0.5) * 60;
    const animation = el.animate(
      [
        { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
        { transform: `translate(${drift * 0.3}px, -40px) scale(1.15)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${drift}px, -260px) scale(1)`, opacity: 0 },
      ],
      { duration: durationMs, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
    );
    return () => animation.cancel();
  }, [reaction.lane, durationMs]);

  return (
    <div
      ref={ref}
      className="absolute bottom-0 flex flex-col items-center"
      style={{ right: `${8 + reaction.lane * 22}%` }}
    >
      <span className="text-4xl drop-shadow-lg sm:text-5xl">{reaction.emoji}</span>
      {reaction.name && (
        <span className="mt-0.5 max-w-24 truncate rounded-full bg-black/50 px-2 py-px text-[10px] text-white/90">
          {reaction.name}
        </span>
      )}
    </div>
  );
}

/**
 * Floating emoji reactions. Owns its own state and event subscription, so a
 * room full of people spamming hearts only re-renders this overlay — never
 * the video stage or controls.
 */
export const ReactionsOverlay = memo(function ReactionsOverlay({
  bus,
  selfId,
  selfName,
}: {
  bus: ReactionBus;
  selfId: string;
  selfName: string;
}) {
  const { floating, durationMs } = useFloatingReactions({ bus, selfId, selfName });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-80 overflow-hidden" aria-hidden>
      {floating.map((r) => (
        <Floater key={r.id} reaction={r} durationMs={durationMs} />
      ))}
    </div>
  );
});
