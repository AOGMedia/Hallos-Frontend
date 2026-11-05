"use client";

import { memo, useMemo, useState } from "react";
import { hasAudio, hasVideo, useCallStateHooks, type StreamVideoParticipant } from "@stream-io/video-react-sdk";
import { Gift, Hand, Mic, MicOff, Search, ShieldCheck, ShieldOff, UserX, Users, Video, VideoOff } from "lucide-react";
import type { RaisedHand } from "../hooks/useRaisedHands";
import { RoomAvatar } from "./RoomAvatar";
import { SpeakingBars } from "./RoomIndicators";
import { Sheet } from "./Sheet";

interface ParticipantsPanelProps {
  open: boolean;
  onClose: () => void;
  hostUserIds: ReadonlySet<string>;
  handQueue: RaisedHand[];
  handPositions: ReadonlyMap<string, number>;
  /** Creator / co-host: can mute, remove, lower hands and gift participants. */
  canModerate: boolean;
  onMute: (p: StreamVideoParticipant) => Promise<void>;
  onMuteAll: () => Promise<number>;
  onRemove: (p: StreamVideoParticipant) => Promise<void>;
  onLowerHand: (userId: string) => void;
  onLowerAll: () => void;
  /** Host: open the gift sheet for this participant. */
  onGift?: (person: { id: string; name: string }) => void;
  /** Who created the class, so co-hosts can be labelled as such. */
  creatorId?: string;
  /** Host or co-host right now (follows live role changes). */
  isHostUser?: (p: StreamVideoParticipant) => boolean;
  /** Creator only: make someone a co-host or remove the role. */
  onSetCohost?: (p: StreamVideoParticipant, makeHost: boolean) => Promise<void>;
}

const SEARCH_FROM = 8;
const iconBtn =
  "flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full transition active:scale-95 disabled:opacity-50";

function sinceLabel(raisedAt: number) {
  const secs = Math.max(0, Math.round((Date.now() - raisedAt) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  return mins === 1 ? "1 min ago" : `${mins} mins ago`;
}

/** Meet's "Raised hands" section: first raised first, lower one or all. */
function RaisedHandsSection({
  queue,
  canModerate,
  onLowerHand,
  onLowerAll,
}: {
  queue: RaisedHand[];
  canModerate: boolean;
  onLowerHand: (userId: string) => void;
  onLowerAll: () => void;
}) {
  if (queue.length === 0) return null;
  return (
    <section className="mb-4 rounded-2xl bg-amber-400/[0.07] p-2 ring-1 ring-amber-400/20">
      <header className="flex items-center justify-between px-2 pb-1 pt-1">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200">
          <Hand className="h-3.5 w-3.5" /> Raised hands ({queue.length})
        </h3>
        {canModerate && queue.length > 1 && (
          <button type="button" onClick={onLowerAll} className="rounded-full px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-400/10">
            Lower all
          </button>
        )}
      </header>
      <ol className="space-y-1">
        {queue.map((hand, index) => (
          <li key={hand.userId} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="w-4 text-center text-sm font-bold text-amber-300">{index + 1}</span>
            <RoomAvatar name={hand.name} image={hand.image} className="h-9 w-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{hand.name}</p>
              <p className="text-[11px] text-white/50">{sinceLabel(hand.raisedAt)}</p>
            </div>
            {canModerate && (
              <button
                type="button"
                onClick={() => onLowerHand(hand.userId)}
                className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/15 active:scale-95"
              >
                Lower
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The list itself. Mounted only while the panel is open, so the participant
 * subscription (which updates as people speak) costs nothing when it's closed.
 */
function ParticipantList(props: Omit<ParticipantsPanelProps, "open" | "onClose" | "onMuteAll">) {
  const { hostUserIds, handQueue, handPositions, canModerate, onMute, onRemove, onGift, creatorId, isHostUser, onSetCohost } =
    props;
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const isHost = (p: StreamVideoParticipant) =>
    isHostUser ? isHostUser(p) : hostUserIds.has(p.userId) || Boolean(p.roles?.includes("admin"));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = (p: StreamVideoParticipant) => (isHost(p) ? 0 : p.isLocalParticipant ? 1 : 2);
    return participants
      .filter((p) => !q || (p.name || "").toLowerCase().includes(q))
      .sort((a, b) => rank(a) - rank(b) || (a.name || "").localeCompare(b.name || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isHost only reads hostUserIds / isHostUser
  }, [participants, query, hostUserIds, isHostUser]);

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
      <RaisedHandsSection
        queue={handQueue}
        canModerate={canModerate}
        onLowerHand={props.onLowerHand}
        onLowerAll={props.onLowerAll}
      />

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

      <h3 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-white/50">In the class</h3>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/50">No one matches “{query}”.</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((p) => {
            const micOn = hasAudio(p);
            const camOn = hasVideo(p);
            const hand = handPositions.get(p.userId);
            const host = isHost(p);
            const cohost = host && Boolean(creatorId) && p.userId !== creatorId;
            const name = p.name || "this person";
            return (
              <li key={p.sessionId} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white/5">
                <RoomAvatar name={p.name || p.userId} image={p.image} speaking={p.isSpeaking} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{p.isLocalParticipant ? `${p.name || "You"} (You)` : p.name || "Guest"}</span>
                    {host && (
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${
                          cohost ? "bg-primary/25 text-primary" : "bg-primary"
                        }`}
                      >
                        {cohost ? "Co-host" : "Host"}
                      </span>
                    )}
                  </p>
                  {hand !== undefined && (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-amber-300">
                      <Hand className="h-3 w-3" /> Hand raised · #{hand}
                    </p>
                  )}
                </div>
                <span
                  className="flex shrink-0 items-center gap-1.5 text-white/50"
                  aria-label={`${micOn ? "Mic on" : "Mic off"}, ${camOn ? "camera on" : "camera off"}`}
                >
                  {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  {!micOn ? (
                    <MicOff className="h-4 w-4 text-red-400" />
                  ) : p.isSpeaking ? (
                    <SpeakingBars className="text-primary" />
                  ) : (
                    <Mic className="h-4 w-4 text-white" />
                  )}
                </span>
                {canModerate && !p.isLocalParticipant && micOn && (
                  <button
                    type="button"
                    disabled={busy === `mute-${p.sessionId}`}
                    onClick={() => void run(`mute-${p.sessionId}`, () => onMute(p))}
                    aria-label={`Mute ${p.name || "this person"}`}
                    title="Mute"
                    className={`${iconBtn} bg-white/10 hover:bg-white/15`}
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
                    className={`${iconBtn} bg-gradient-to-br from-amber-400 to-pink-500 text-white`}
                  >
                    <Gift className="h-4 w-4" />
                  </button>
                )}
                {onSetCohost && !p.isLocalParticipant && (cohost || !host) && (
                  <button
                    type="button"
                    disabled={busy === `cohost-${p.sessionId}`}
                    onClick={() => {
                      const ask = cohost
                        ? `Remove ${name} as co-host?`
                        : `Make ${name} a co-host? They'll be able to mute, spotlight and manage people in this class.`;
                      if (window.confirm(ask)) void run(`cohost-${p.sessionId}`, () => onSetCohost(p, !cohost));
                    }}
                    aria-label={cohost ? `Remove ${name} as co-host` : `Make ${name} a co-host`}
                    title={cohost ? "Remove as co-host" : "Make co-host"}
                    className={`${iconBtn} ${cohost ? "bg-primary/25 text-primary hover:bg-primary/35" : "bg-white/10 hover:bg-white/15"}`}
                  >
                    {cohost ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </button>
                )}
                {canModerate && !p.isLocalParticipant && !host && (
                  <button
                    type="button"
                    disabled={busy === `remove-${p.sessionId}`}
                    onClick={() => {
                      if (window.confirm(`Remove ${p.name || "this person"} from the class?`)) {
                        void run(`remove-${p.sessionId}`, () => onRemove(p));
                      }
                    }}
                    aria-label={`Remove ${p.name || "this person"}`}
                    title="Remove from class"
                    className={`${iconBtn} hidden bg-white/10 text-red-300 hover:bg-red-500/15 sm:flex`}
                  >
                    <UserX className="h-4 w-4" />
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

/** Everyone in the class, raised hands first. Hosts can mute (one or all), remove and gift; the creator can make co-hosts. */
export const ParticipantsPanel = memo(function ParticipantsPanel(props: ParticipantsPanelProps) {
  const { useParticipantCount } = useCallStateHooks();
  const count = useParticipantCount();
  const [mutingAll, setMutingAll] = useState(false);

  const muteAll = async () => {
    setMutingAll(true);
    try {
      await props.onMuteAll();
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
      mobileHeight="h-[72dvh]"
      headerAction={
        props.canModerate && count > 1 ? (
          <button
            type="button"
            disabled={mutingAll}
            onClick={() => void muteAll()}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 active:scale-95 disabled:opacity-50"
          >
            <MicOff className="h-3.5 w-3.5" /> {mutingAll ? "Muting…" : "Mute all"}
          </button>
        ) : null
      }
    >
      {props.open && <ParticipantList {...props} />}
    </Sheet>
  );
});
