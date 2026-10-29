"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { GiftDefinition } from "../api";
import { describeGiftEvent, giftLook, useGiftEvents } from "../hooks/useGifts";
import type { GiftEventPayload } from "../lib/events";

interface ShowingGift {
  id: string;
  emoji: string;
  animation: string;
  /** e.g. "Ada sent you a Rose" */
  line: string;
}

const SHOW_MS = 2400;
const MAX_QUEUED = 8;

/** Keyframes per gift — transform and opacity only, so the GPU does the work. */
const KEYFRAMES: Record<string, Keyframe[]> = {
  pop: [
    { transform: "scale(0.2)", opacity: 0 },
    { transform: "scale(1.25)", opacity: 1, offset: 0.25 },
    { transform: "scale(1)", opacity: 1, offset: 0.4 },
    { transform: "scale(1.05)", opacity: 1, offset: 0.8 },
    { transform: "scale(0.6)", opacity: 0 },
  ],
  heartbeat: [
    { transform: "scale(0.3)", opacity: 0 },
    { transform: "scale(1.1)", opacity: 1, offset: 0.2 },
    { transform: "scale(0.95)", offset: 0.35 },
    { transform: "scale(1.15)", offset: 0.5 },
    { transform: "scale(1)", opacity: 1, offset: 0.8 },
    { transform: "scale(1.4)", opacity: 0 },
  ],
  bloom: [
    { transform: "scale(0.1) rotate(-90deg)", opacity: 0 },
    { transform: "scale(1.1) rotate(8deg)", opacity: 1, offset: 0.35 },
    { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.8 },
    { transform: "scale(1.2) rotate(0deg)", opacity: 0 },
  ],
  bounce: [
    { transform: "translateY(-60vh)", opacity: 0 },
    { transform: "translateY(0)", opacity: 1, offset: 0.3 },
    { transform: "translateY(-12vh)", offset: 0.45 },
    { transform: "translateY(0)", offset: 0.6 },
    { transform: "translateY(-4vh)", offset: 0.7 },
    { transform: "translateY(0)", opacity: 1, offset: 0.85 },
    { transform: "translateY(0) scale(0.8)", opacity: 0 },
  ],
  fly: [
    { transform: "translate(-60vw, 40vh) rotate(-20deg) scale(0.6)", opacity: 0 },
    { transform: "translate(-10vw, 8vh) rotate(-8deg) scale(1)", opacity: 1, offset: 0.35 },
    { transform: "translate(0, 0) rotate(0deg) scale(1.1)", opacity: 1, offset: 0.6 },
    { transform: "translate(60vw, -50vh) rotate(15deg) scale(0.7)", opacity: 0 },
  ],
  shine: [
    { transform: "scale(0.3) rotate(-30deg)", opacity: 0 },
    { transform: "scale(1.2) rotate(10deg)", opacity: 1, offset: 0.3 },
    { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.45 },
    { transform: "scale(1.08) rotate(-4deg)", opacity: 1, offset: 0.7 },
    { transform: "scale(1.5) rotate(0deg)", opacity: 0 },
  ],
  crown: [
    { transform: "translateY(-50vh) rotate(-25deg)", opacity: 0 },
    { transform: "translateY(0) rotate(6deg)", opacity: 1, offset: 0.35 },
    { transform: "translateY(0) rotate(-3deg)", offset: 0.5 },
    { transform: "translateY(0) rotate(0deg) scale(1.1)", opacity: 1, offset: 0.8 },
    { transform: "translateY(-8vh) scale(0.9)", opacity: 0 },
  ],
};

function GiftBurst({ gift, onDone }: { gift: ShowingGift; onDone: () => void }) {
  const emojiRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const emoji = emojiRef.current;
    const banner = bannerRef.current;
    if (!emoji || typeof emoji.animate !== "function") {
      const timer = setTimeout(onDone, SHOW_MS);
      return () => clearTimeout(timer);
    }
    const options = { duration: SHOW_MS, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" as const };
    const main = emoji.animate(KEYFRAMES[gift.animation] ?? KEYFRAMES.pop, options);
    const text = banner?.animate(
      [
        { transform: "translateY(12px)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1, offset: 0.15 },
        { transform: "translateY(0)", opacity: 1, offset: 0.85 },
        { transform: "translateY(-6px)", opacity: 0 },
      ],
      options
    );
    main.onfinish = onDone;
    return () => {
      main.cancel();
      text?.cancel();
    };
  }, [gift, onDone]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={emojiRef} className="text-[7rem] leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:text-[9rem]">
        {gift.emoji}
      </div>
      <div ref={bannerRef} className="max-w-[85vw] rounded-full bg-black/70 px-4 py-2 text-center text-sm font-semibold text-white">
        {gift.line}!
      </div>
    </div>
  );
}

/**
 * Plays gifts one after another in the middle of the stage. Listens to the
 * room itself, so gift bursts never re-render the video stage or controls.
 */
export const GiftOverlay = memo(function GiftOverlay({
  catalog,
  selfId,
}: {
  catalog: GiftDefinition[] | undefined;
  selfId: string;
}) {
  const [queue, setQueue] = useState<ShowingGift[]>([]);
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  useGiftEvents((event: GiftEventPayload) => {
    const look = giftLook(event.code, catalogRef.current);
    const line = describeGiftEvent(event, selfId, look.name);
    // A burst of gifts: keep the newest few so it never falls minutes behind.
    setQueue((prev) => [...prev, { id: event.id, emoji: look.emoji, animation: look.animation, line }].slice(-MAX_QUEUED));
  });

  const done = useCallback(() => setQueue((prev) => prev.slice(1)), []);
  const current = queue[0];
  if (!current) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden" aria-live="polite">
      <GiftBurst key={current.id} gift={current} onDone={done} />
    </div>
  );
});
