"use client";

import { memo, useMemo, useState } from "react";
import {
  hasAudio,
  hasVideo,
  useCall,
  useCallStateHooks,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { Gift, Hand, Mic, MicOff, Search, Users, Video, VideoOff } from "lucide-react";
import { RoomAvatar } from "./RoomAvatar";
import { friendlyError } from "../lib/errors";
import { Sheet } from "./Sheet";

interface ParticipantsPanelProps {
  open: boolean;
  onClose: () => void;
  hostUserIds: ReadonlySet<string>;
  handPositions: ReadonlyMap<string, number>;
  /** Creator / co-host: can mute others and gift participants. */
  canModerate: boolean;
  onNotice: (message: string, tone: "success" | "error") => void;
  /** Host: open the gift sheet for this participant. */
  onGift?: (person: { id: string; name: string }) => void;
}

const SEARCH_FROM = 8;

/**
 * The list itself. Mounted only while the panel is open, so the participant
 * subscription (which updates as people speak) costs nothing when it's closed.
 */
function ParticipantList({ hostUserIds, handPositions, canModerate, onNotice, onGift }: Omit<ParticipantsPanelProps, "open" | "onClose">) {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [query, setQuery] = useState("");
  const [muting, setMuting] = useState<string | null>(null);

  const isHost = (p: StreamVideoParticipant) => hostUserIds.has(p.userId) || Boolean(p.roles?.includes("admin"));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = (p: StreamVideoParticipant) => (isHost(p) ? 0 : handPositions.has(p.userId) ? 1 : p.isLocalParticipant ? 2 : 3);
    return participants
      .filter((p) => !q || (p.name || "").toLowerCase().includes(q))
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          (handPositions.get(a.userId) ?? 0) - (handPositions.get(b.userId) ?? 0) ||
          (a.name || "").localeCompare(b.name || "")
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isHost only reads hostUserIds
  }, [participants, query, hostUserIds, handPositions]);

  const mute = async (p: StreamVideoParticipant) => {
    if (!call) return;
    setMuting(p.sessionId);
    try {
      await call.muteUser(p.userId, "audio");
      onNotice(`${p.name || "They"} ${p.name ? "is" : "are"} muted`, "success");
    } catch (error) {
      onNotice(friendlyError(error, "We couldn't mute them. Please try again."), "error");
    } finally {
      setMuting(null);
    }
  };

  return (
    <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
      {participants.length >= SEARCH_FROM && (
        <label className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            aria-label="Search people"
            className="h-11 w-full bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none sm:text-sm"
          />
        </label>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/50">No one matches “{query}”.</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((p) => {
            const micOn = hasAudio(p);
            const camOn = hasVideo(p);
            const hand = handPositions.get(p.userId);
            const host = isHost(p);
            return (
              <li key={p.sessionId} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white/5">
                <RoomAvatar name={p.name || p.userId} image={p.image} speaking={p.isSpeaking} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{p.isLocalParticipant ? `${p.name || "You"} (You)` : p.name || "Guest"}</span>
                    {host && (
                      <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">
                        Host
                      </span>
                    )}
                  </p>
                  {hand !== undefined && (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-amber-300">
                      <Hand className="h-3 w-3" /> Hand raised · #{hand}
                    </p>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-white/50" aria-label={`${micOn ? "Mic on" : "Mic off"}, ${camOn ? "camera on" : "camera off"}`}>
                  {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  {micOn ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-red-400" />}
                </span>
                {canModerate && !p.isLocalParticipant && micOn && (
                  <button
                    type="button"
                    disabled={muting === p.sessionId}
                    onClick={() => void mute(p)}
                    aria-label={`Mute ${p.name || "this person"}`}
                    title="Mute"
                    className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15 active:scale-95 disabled:opacity-50"
                  >
                    <MicOff className="h-4 w-4" />
                  </button>
                )}
                {canModerate && onGift && !p.isLocalParticipant && (
                  <button
                    type="button"
                    onClick={() => onGift({ id: p.userId, name: p.name || "this participant" })}
                    aria-label={`Send ${p.name || "this person"} a gift`}
                    title="Send a gift"
                    className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white transition active:scale-95"
                  >
                    <Gift className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Everyone in the class. Hosts can mute people (one at a time or all at once). */
export const ParticipantsPanel = memo(function ParticipantsPanel(props: ParticipantsPanelProps) {
  const call = useCall();
  const { useParticipantCount } = useCallStateHooks();
  const count = useParticipantCount();
  const [mutingAll, setMutingAll] = useState(false);

  const muteAll = async () => {
    if (!call) return;
    setMutingAll(true);
    try {
      await call.muteAllUsers("audio");
      props.onNotice("Everyone is muted. They can unmute themselves when they need to speak.", "success");
    } catch (error) {
      props.onNotice(friendlyError(error, "We couldn't mute everyone. Please try again."), "error");
    } finally {
      setMutingAll(false);
    }
  };

  return (
    <Sheet
      open={props.open}
      onClose={props.onClose}
      title={`People (${count})`}
      icon={<Users className="h-4 w-4 text-primary" />}
      mobileHeight="h-[70dvh]"
      headerAction={
        props.canModerate && count > 1 ? (
          <button
            type="button"
            disabled={mutingAll}
            onClick={() => void muteAll()}
            className="rounded-full px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
          >
            Mute all
          </button>
        ) : null
      }
    >
      {props.open && (
        <ParticipantList
          hostUserIds={props.hostUserIds}
          handPositions={props.handPositions}
          canModerate={props.canModerate}
          onNotice={props.onNotice}
          onGift={props.onGift}
        />
      )}
    </Sheet>
  );
});
