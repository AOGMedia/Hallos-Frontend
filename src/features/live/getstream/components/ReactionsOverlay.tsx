"use client";

import { memo, useEffect, useRef } from "react";
import { useFloatingReactions, type FloatingReaction, type ReactionBus } from "../hooks/useReactions";

/**
 * One reaction, Google Meet style: rises from the bottom-left with a gentle
 * side-to-side sway, the sender's name riding underneath, and fades near the
 * top. Web Animations API with transform/opacity only (GPU), no global CSS.
 */
function Floater({ reaction, durationMs }: { reaction: FloatingReaction; durationMs: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const sway = 14 + reaction.lane * 18;
    const dir = reaction.lane > 0.5 ? 1 : -1;
    const animation = el.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(0.5)", opacity: 0 },
        { transform: `translate3d(${dir * sway * 0.4}px, -8vh, 0) scale(1.08)`, opacity: 1, offset: 0.12 },
        { transform: `translate3d(${-dir * sway}px, -20vh, 0) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate3d(${dir * sway}px, -34vh, 0) scale(1)`, opacity: 1, offset: 0.6 },
        { transform: `translate3d(${-dir * sway * 0.6}px, -46vh, 0) scale(0.96)`, opacity: 0.85, offset: 0.82 },
        { transform: `translate3d(0, -54vh, 0) scale(0.9)`, opacity: 0 },
      ],
      { duration: durationMs, easing: "cubic-bezier(.25,.6,.35,1)", fill: "forwards" }
    );
    return () => animation.cancel();
  }, [reaction.lane, durationMs]);

  return (
    <div ref={ref} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${3 + reaction.lane * 16}%` }}>
      <span className="text-[2.6rem] leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] sm:text-5xl">{reaction.emoji}</span>
      {reaction.name && (
        <span className="mt-1 max-w-28 truncate rounded-full bg-[#1f2537]/90 px-2 py-0.5 text-[11px] font-medium text-white shadow">
          {reaction.name}
        </span>
      )}
    </div>
  );
}

/**
 * Floating emoji reactions. Owns its own state and event subscription, so a
 * room full of people sending hearts only re-renders this overlay — never
 * the video stage or controls.
 */
export const ReactionsOverlay = memo(function ReactionsOverlay({ bus, selfId }: { bus: ReactionBus; selfId: string }) {
  // Your own reactions are labelled "You", like Meet.
  const { floating, durationMs } = useFloatingReactions({ bus, selfId, selfName: "You" });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[62vh] overflow-hidden" aria-hidden>
      {floating.map((r) => (
        <Floater key={r.id} reaction={r} durationMs={durationMs} />
      ))}
    </div>
  );
});
