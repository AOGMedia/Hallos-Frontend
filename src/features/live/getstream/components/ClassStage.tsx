"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { hasScreenShare, useCall, useCallStateHooks, type StreamVideoParticipant } from "@stream-io/video-react-sdk";
import { Users } from "lucide-react";
import { ParticipantTile } from "./ParticipantTile";

/** Phones stack tiles in one column; wider screens use two. */
const SMALL_GRID: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1",
  3: "grid-cols-1 grid-rows-3 sm:grid-cols-2 sm:grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

/** Most filmstrip tiles rendered at once — big classes stay light on phones. */
const filmstripLimit = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 24 : 48;

/** The active speaker must hold the floor this long before the spotlight moves. */
const SPOTLIGHT_HOLD_MS = 3000;

interface ClassStageProps {
  hostUserIds: ReadonlySet<string>;
  /** userId -> place in the raised-hands queue. */
  handPositions: ReadonlyMap<string, number>;
}

/**
 * Mobile-first layout: one large "spotlight" (whoever is presenting, else the
 * active speaker, else the host) with everyone else in a filmstrip — a row
 * along the bottom on phones, a column on the right on large screens.
 * Small classes (≤ 4 people, nobody presenting) use an even grid instead.
 *
 * Performance: the stage is the SDK "viewport", so only tiles actually on
 * screen receive video; the filmstrip renders a capped number of tiles; and
 * the spotlight doesn't flip on every short burst of speech.
 */
export const ClassStage = memo(function ClassStage({ hostUserIds, handPositions }: ClassStageProps) {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const rootRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<{ sessionId: string; since: number } | null>(null);

  // Only tiles visible inside the stage get video (saves data and CPU).
  useEffect(() => {
    const el = rootRef.current;
    if (!call || !el) return;
    return call.setViewport(el);
  }, [call]);

  const presenter = useMemo(() => participants.find(hasScreenShare), [participants]);

  const spotlight = useMemo<StreamVideoParticipant | undefined>(() => {
    if (presenter) return presenter;
    const candidate =
      participants.find((p) => p.isDominantSpeaker && !p.isLocalParticipant) ??
      participants.find((p) => hostUserIds.has(p.userId) && !p.isLocalParticipant) ??
      participants.find((p) => !p.isLocalParticipant) ??
      participants[0];

    // Keep the current spotlight for a moment unless they've left.
    const held = spotlightRef.current;
    const current = held && participants.find((p) => p.sessionId === held.sessionId);
    const now = Date.now();
    if (current && candidate && candidate.sessionId !== held.sessionId && now - held.since < SPOTLIGHT_HOLD_MS) {
      return current;
    }
    if (candidate && (!held || held.sessionId !== candidate.sessionId)) {
      spotlightRef.current = { sessionId: candidate.sessionId, since: now };
    }
    return candidate;
  }, [participants, presenter, hostUserIds]);

  const tileProps = (p: StreamVideoParticipant) => ({
    participant: p,
    // Call members list, or the participant's own call role if that hasn't loaded.
    isHost: hostUserIds.has(p.userId) || Boolean(p.roles?.includes("admin")),
    handPosition: handPositions.get(p.userId),
  });

  let content;
  if (participants.length === 0) {
    content = <div className="flex h-full items-center justify-center text-sm text-white/60">Connecting to the class…</div>;
  } else if (!presenter && participants.length <= 4) {
    // Small class, nobody presenting: an even grid reads best.
    const layout = SMALL_GRID[participants.length] ?? SMALL_GRID[4];
    content = (
      <div className={`grid h-full gap-2 p-2 sm:gap-3 sm:p-3 ${layout}`}>
        {participants.map((p) => (
          <ParticipantTile key={p.sessionId} {...tileProps(p)} className="h-full min-h-0" />
        ))}
      </div>
    );
  } else {
    const others = participants.filter((p) => p !== spotlight || Boolean(presenter));
    const limit = filmstripLimit();
    const shown = others.slice(0, limit);
    const hidden = others.length - shown.length;

    content = (
      <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:flex-row">
        <div className="min-h-0 flex-1">
          {spotlight && <ParticipantTile {...tileProps(spotlight)} screen={Boolean(presenter)} className="h-full w-full" />}
        </div>
        {others.length > 0 && (
          <div className="flex h-28 shrink-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] sm:h-32 lg:h-auto lg:w-56 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 xl:w-64 [&::-webkit-scrollbar]:hidden">
            {shown.map((p) => (
              <ParticipantTile key={p.sessionId} {...tileProps(p)} className="aspect-[3/4] h-full shrink-0 sm:aspect-video lg:h-auto lg:w-full" />
            ))}
            {hidden > 0 && (
              <div className="flex aspect-[3/4] h-full shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white/5 text-white/70 sm:aspect-video lg:h-auto lg:w-full">
                <Users className="h-5 w-5" />
                <span className="text-sm font-semibold">+{hidden}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="h-full overflow-hidden">
      {content}
    </div>
  );
});
