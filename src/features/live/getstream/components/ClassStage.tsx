"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  hasScreenShare,
  hasVideo,
  useCall,
  useCallStateHooks,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { Expand, Users } from "lucide-react";
import { ParticipantTile } from "./ParticipantTile";
import { DraggablePip, ZoomPan } from "./Gestures";

export type StageLayout = "auto" | "tiled" | "spotlight";

/** Phones stack tiles in one column; wider screens use two. */
const SMALL_GRID: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1",
  3: "grid-cols-1 grid-rows-3 sm:grid-cols-2 sm:grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

/** Most small tiles rendered at once — big classes stay light on phones. */
const tileLimit = (phone: boolean) => (phone ? 24 : 48);

/** The active speaker must hold the floor this long before the spotlight moves. */
const SPOTLIGHT_HOLD_MS = 3000;

const HOST_CALL_ROLE = "admin";

function useIsPhone() {
  const query = "(max-width: 767px)";
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setPhone(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return phone;
}

interface ClassStageProps {
  hostUserIds: ReadonlySet<string>;
  /** userId -> place in the raised-hands queue. */
  handPositions: ReadonlyMap<string, number>;
  layout: StageLayout;
  /** Someone a host spotlighted for everyone. */
  spotlightUserId: string | null;
  /** A tap on the stage (phones: show/hide the controls). */
  onTap?: () => void;
}

/**
 * The video area.
 *   - Auto: the active speaker large with everyone else in a filmstrip (an
 *     even grid for small classes). Phones get the Meet-app treatment: you in a
 *     draggable floating window, the others on screen.
 *   - Tiled: everyone in an even grid. Spotlight: only the featured person.
 *   - Pinned (for me) or spotlighted (by a host) people take the main view.
 *   - Raised hands come first, so they're never hidden in a big class.
 *   - Someone presenting on a phone: a full-screen, zoomable presentation.
 *
 * Performance: the stage is the SDK "viewport" (only visible tiles get video),
 * tile counts are capped, and the speaker spotlight doesn't flip on every
 * short burst of speech.
 */
export const ClassStage = memo(function ClassStage({ hostUserIds, handPositions, layout, spotlightUserId, onTap }: ClassStageProps) {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const phone = useIsPhone();
  const rootRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<{ sessionId: string; since: number } | null>(null);

  // Only tiles visible inside the stage get video (saves data and CPU).
  useEffect(() => {
    const el = rootRef.current;
    if (!call || !el) return;
    return call.setViewport(el);
  }, [call]);

  const isHost = (p: StreamVideoParticipant) => hostUserIds.has(p.userId) || Boolean(p.roles?.includes(HOST_CALL_ROLE));
  const tileProps = (p: StreamVideoParticipant) => ({ participant: p, isHost: isHost(p), handPosition: handPositions.get(p.userId) });

  /** Raised hands first (in queue order), otherwise the SDK's order (speakers, video…). */
  const byHands = (list: StreamVideoParticipant[]) =>
    [...list].sort((a, b) => (handPositions.get(a.userId) ?? Infinity) - (handPositions.get(b.userId) ?? Infinity));

  const presenter = useMemo(() => participants.find(hasScreenShare), [participants]);
  const featured = useMemo(
    () => participants.find((p) => p.pin) ?? (spotlightUserId ? participants.find((p) => p.userId === spotlightUserId) : undefined),
    [participants, spotlightUserId]
  );

  const speaker = useMemo<StreamVideoParticipant | undefined>(() => {
    const candidate =
      participants.find((p) => p.isDominantSpeaker && !p.isLocalParticipant) ??
      participants.find((p) => isHost(p) && !p.isLocalParticipant) ??
      participants.find((p) => !p.isLocalParticipant) ??
      participants[0];
    // Keep the current speaker for a moment unless they've left.
    const held = spotlightRef.current;
    const current = held && participants.find((p) => p.sessionId === held.sessionId);
    const now = Date.now();
    if (current && candidate && candidate.sessionId !== held.sessionId && now - held.since < SPOTLIGHT_HOLD_MS) return current;
    if (candidate && (!held || held.sessionId !== candidate.sessionId)) spotlightRef.current = { sessionId: candidate.sessionId, since: now };
    return candidate;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isHost only reads hostUserIds
  }, [participants, hostUserIds]);

  const self = participants.find((p) => p.isLocalParticipant);
  const filmstrip = (list: StreamVideoParticipant[]) => {
    const ordered = byHands(list);
    const shown = ordered.slice(0, tileLimit(phone));
    const hidden = ordered.length - shown.length;
    return (
      <div className="flex h-28 shrink-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] sm:h-32 lg:h-auto lg:w-56 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 xl:w-64 [&::-webkit-scrollbar]:hidden">
        {shown.map((p) => (
          <ParticipantTile key={p.sessionId} {...tileProps(p)} className="aspect-[3/4] h-full shrink-0 sm:aspect-video lg:h-auto lg:w-full" />
        ))}
        {hidden > 0 && <MoreTile count={hidden} className="aspect-[3/4] h-full shrink-0 sm:aspect-video lg:h-auto lg:w-full" />}
      </div>
    );
  };
  const selfPip =
    phone && self ? (
      <DraggablePip className="h-36 w-24">
        <ParticipantTile {...tileProps(self)} className="h-full w-full !rounded-2xl" />
      </DraggablePip>
    ) : null;

  let content: React.ReactNode;

  if (participants.length === 0) {
    content = <div className="flex h-full items-center justify-center text-sm text-white/60">Connecting to the class…</div>;
  } else if (presenter && phone) {
    content = <PresentationView presenter={presenter} count={participants.length} onTap={onTap} />;
  } else if (presenter) {
    // Desktop: the shared screen large, everyone in the filmstrip.
    content = (
      <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:flex-row">
        <div className="min-h-0 flex-1">
          <ParticipantTile {...tileProps(presenter)} screen className="h-full w-full" />
        </div>
        {filmstrip(participants)}
      </div>
    );
  } else if (layout === "tiled") {
    const ordered = byHands(participants);
    const shown = ordered.slice(0, tileLimit(phone));
    const hidden = ordered.length - shown.length;
    const cols = phone ? "grid-cols-2" : shown.length <= 4 ? "grid-cols-2" : shown.length <= 9 ? "grid-cols-3" : "grid-cols-4";
    content = (
      <div className={`grid h-full auto-rows-[minmax(0,1fr)] content-start gap-2 overflow-y-auto p-2 sm:gap-3 sm:p-3 ${cols}`}>
        {shown.map((p) => (
          <ParticipantTile key={p.sessionId} {...tileProps(p)} className="aspect-video min-h-0 w-full" />
        ))}
        {hidden > 0 && <MoreTile count={hidden} className="aspect-video w-full" />}
      </div>
    );
  } else if (layout === "spotlight" || featured) {
    const main = featured ?? speaker;
    const others = participants.filter((p) => p !== main && !(phone && p.isLocalParticipant));
    content = (
      <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:flex-row">
        <div className="min-h-0 flex-1">{main && <ParticipantTile {...tileProps(main)} className="h-full w-full" />}</div>
        {layout !== "spotlight" && others.length > 0 && filmstrip(others)}
        {main && !main.isLocalParticipant && selfPip}
      </div>
    );
  } else if (participants.length <= 4) {
    // Small class. Phones: everyone else on screen, you floating (Meet app).
    const onStage = phone && participants.length > 1 ? participants.filter((p) => !p.isLocalParticipant) : participants;
    const grid = SMALL_GRID[onStage.length] ?? SMALL_GRID[4];
    content = (
      <div className={`grid h-full gap-2 p-2 sm:gap-3 sm:p-3 ${grid}`}>
        {onStage.map((p) => (
          <ParticipantTile key={p.sessionId} {...tileProps(p)} className="h-full min-h-0" />
        ))}
        {phone && participants.length > 1 && selfPip}
      </div>
    );
  } else {
    const others = participants.filter((p) => p !== speaker && !(phone && p.isLocalParticipant));
    content = (
      <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:flex-row">
        <div className="min-h-0 flex-1">{speaker && <ParticipantTile {...tileProps(speaker)} className="h-full w-full" />}</div>
        {others.length > 0 && filmstrip(others)}
        {speaker && !speaker.isLocalParticipant && selfPip}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative h-full overflow-hidden" onClick={presenter && phone ? undefined : onTap}>
      {content}
    </div>
  );
});

function MoreTile({ count, className = "" }: { count: number; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/5 text-white/70 ${className}`}>
      <Users className="h-5 w-5" />
      <span className="text-sm font-semibold">+{count}</span>
    </div>
  );
}

/**
 * Someone is presenting and you're on a phone — like the Meet app: the shared
 * screen fills the display (never cropped), pinch/double-tap to zoom and drag
 * to read details, the presenter's camera floats in a corner, and you can go
 * full screen (turning the phone sideways helps too).
 */
const PresentationView = memo(function PresentationView({
  presenter,
  count,
  onTap,
}: {
  presenter: StreamVideoParticipant;
  count: number;
  onTap?: () => void;
}) {
  const [hint, setHint] = useState(true);
  const canFullscreen = typeof document !== "undefined" && Boolean(document.fullscreenEnabled);

  useEffect(() => {
    const timer = setTimeout(() => setHint(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const goFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
      const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      await orientation.lock?.("landscape").catch(() => {});
    } catch {
      // Not allowed here (e.g. iOS): rotating the phone still gives a bigger view.
    }
  };

  return (
    <div className="relative h-full w-full bg-black">
      <ZoomPan onTap={onTap}>
        <ParticipantTile participant={presenter} isHost={false} screen className="h-full w-full !rounded-none" />
      </ZoomPan>

      {presenter && !presenter.isLocalParticipant && hasVideo(presenter) && (
        <DraggablePip className="h-28 w-20">
          <ParticipantTile participant={presenter} isHost={false} className="h-full w-full !rounded-2xl" />
        </DraggablePip>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
          <Users className="h-3.5 w-3.5" /> {count}
        </span>
      </div>
      {canFullscreen && (
        <button
          type="button"
          aria-label="Full screen"
          onClick={(e) => {
            e.stopPropagation();
            void goFullscreen();
          }}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 touch-manipulation items-center justify-center rounded-full bg-black/65 text-white"
        >
          <Expand className="h-5 w-5" />
        </button>
      )}
      {hint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <span className="rounded-full bg-black/70 px-3.5 py-1.5 text-xs text-white/90">Pinch or double-tap to zoom</span>
        </div>
      )}
    </div>
  );
});
