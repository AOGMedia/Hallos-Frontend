"use client";

import { useMemo } from "react";
import { hasScreenShare, useCallStateHooks, type StreamVideoParticipant } from "@stream-io/video-react-sdk";
import { ParticipantTile } from "./ParticipantTile";

/** Phones stack tiles in one column; wider screens use two. */
const SMALL_GRID: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1",
  3: "grid-cols-1 grid-rows-3 sm:grid-cols-2 sm:grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

interface ClassStageProps {
  hostUserIds: ReadonlySet<string>;
  raisedHands: ReadonlySet<string>;
}

/**
 * Mobile-first layout: one large "spotlight" (whoever is presenting, else the
 * active speaker, else the host) with everyone else in a filmstrip — a row
 * along the bottom on phones, a column on the right on large screens.
 * Small classes (≤ 4 people, nobody presenting) use an even grid instead.
 */
export function ClassStage({ hostUserIds, raisedHands }: ClassStageProps) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const presenter = useMemo(() => participants.find(hasScreenShare), [participants]);

  const spotlight = useMemo<StreamVideoParticipant | undefined>(() => {
    if (presenter) return presenter;
    return (
      participants.find((p) => p.isDominantSpeaker && !p.isLocalParticipant) ??
      participants.find((p) => hostUserIds.has(p.userId) && !p.isLocalParticipant) ??
      participants.find((p) => !p.isLocalParticipant) ??
      participants[0]
    );
  }, [participants, presenter, hostUserIds]);

  if (participants.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/60">Connecting to the class…</div>
    );
  }

  const tileProps = (p: StreamVideoParticipant) => ({
    participant: p,
    isHost: hostUserIds.has(p.userId),
    handRaised: raisedHands.has(p.userId),
  });

  // Small class, nobody presenting: an even grid reads best.
  if (!presenter && participants.length <= 4) {
    const layout = SMALL_GRID[participants.length] ?? SMALL_GRID[4];
    return (
      <div className={`grid h-full gap-2 p-2 sm:gap-3 sm:p-3 ${layout}`}>
        {participants.map((p) => (
          <ParticipantTile key={p.sessionId} {...tileProps(p)} className="h-full min-h-0" />
        ))}
      </div>
    );
  }

  const others = participants.filter((p) => p !== spotlight || Boolean(presenter));

  return (
    <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:flex-row">
      <div className="min-h-0 flex-1">
        {spotlight && (
          <ParticipantTile {...tileProps(spotlight)} screen={Boolean(presenter)} className="h-full w-full" />
        )}
      </div>
      {others.length > 0 && (
        <div className="flex h-28 shrink-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] sm:h-32 lg:h-auto lg:w-56 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 xl:w-64">
          {others.map((p) => (
            <ParticipantTile
              key={p.sessionId}
              {...tileProps(p)}
              className="aspect-[3/4] h-full shrink-0 sm:aspect-video lg:h-auto lg:w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
