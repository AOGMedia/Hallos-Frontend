"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Copy, Hand, MessageCircle, Users } from "lucide-react";
import type { RaisedHand } from "../hooks/useRaisedHands";
import type { ChatMessage } from "../hooks/useClassChat";
import { RoomAvatar } from "./RoomAvatar";

/**
 * Meet's raised-hands chip, visible to everyone: "✋ Ada" or "✋ Ada and 2
 * others". Tapping opens the People panel at the raised-hands section.
 */
export const RaisedHandsChip = memo(function RaisedHandsChip({ queue, onOpen }: { queue: RaisedHand[]; onOpen: () => void }) {
  if (queue.length === 0) return null;
  const first = queue[0];
  const label = queue.length === 1 ? first.name : `${first.name} and ${queue.length - 1} other${queue.length > 2 ? "s" : ""}`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pointer-events-auto flex max-w-[78vw] touch-manipulation items-center gap-2 rounded-full bg-[#1f2537] py-1.5 pl-1.5 pr-3.5 text-left text-sm text-white shadow-xl ring-1 ring-white/10 transition active:scale-95"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black">
        <Hand className="hallos-wave h-4 w-4" key={first.userId} />
      </span>
      <span className="truncate font-medium">{label}</span>
      <span className="shrink-0 text-xs font-semibold text-amber-300">View</span>
    </button>
  );
});

/** Only you here: say so, and make inviting easy. Watches the head count itself. */
export const EmptyRoomCard = memo(function EmptyRoomCard({
  inviteUrl,
  onCopied,
}: {
  inviteUrl: string;
  onCopied: (ok: boolean) => void;
}) {
  const { useParticipantCount } = useCallStateHooks();
  const count = useParticipantCount();
  const [dismissed, setDismissed] = useState(false);
  if (count > 1 || dismissed) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      onCopied(true);
    } catch {
      onCopied(false);
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-white/10 bg-[#161c2b]/95 p-5 text-center text-white shadow-2xl">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/20">
        <Users className="h-5 w-5 text-primary" />
      </span>
      <p className="font-semibold">You&apos;re the only one here</p>
      <p className="mt-1 text-sm text-white/60">Share the class link so others can join.</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold transition active:scale-95"
        >
          <Copy className="h-4 w-4" /> Copy link
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
});

/** A new message while chat is closed: a small preview bubble (tap to open), like Meet. */
export const ChatPreview = memo(function ChatPreview({
  message,
  chatOpen,
  onOpen,
}: {
  message: ChatMessage | undefined;
  chatOpen: boolean;
  onOpen: () => void;
}) {
  const [shown, setShown] = useState<ChatMessage | null>(null);
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (!message || message.mine || message.id === lastId.current) return;
    lastId.current = message.id;
    if (chatOpen) return;
    setShown(message);
    const timer = setTimeout(() => setShown(null), 4500);
    return () => clearTimeout(timer);
  }, [message, chatOpen]);

  useEffect(() => {
    if (chatOpen) setShown(null);
  }, [chatOpen]);

  if (!shown) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pointer-events-auto flex w-full max-w-xs touch-manipulation items-start gap-2.5 rounded-2xl bg-[#1f2537] p-3 text-left text-white shadow-2xl ring-1 ring-white/10 transition active:scale-[0.98]"
    >
      {shown.system ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-base">🎁</span>
      ) : (
        <RoomAvatar name={shown.name} image={shown.image} className="h-8 w-8 text-[11px]" />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-xs font-semibold text-white/70">
          <MessageCircle className="h-3 w-3" /> {shown.system ? "Hallos" : shown.name}
        </span>
        <span className="mt-0.5 line-clamp-2 text-sm">{shown.photoUrl && !shown.text ? "📷 Photo" : shown.text}</span>
      </span>
    </button>
  );
});

/** Live captions (when the host has turned them on and you haven't hidden them). */
export const CaptionsOverlay = memo(function CaptionsOverlay({ visible }: { visible: boolean }) {
  const { useCallClosedCaptions, useIsCallCaptioningInProgress } = useCallStateHooks();
  const captions = useCallClosedCaptions();
  const captioning = useIsCallCaptioningInProgress();
  if (!visible || !captioning || captions.length === 0) return null;

  const recent = captions.slice(-2);
  return (
    <div className="pointer-events-none mx-auto w-full max-w-2xl px-3" aria-live="polite">
      <div className="rounded-2xl bg-black/75 px-4 py-2.5 text-center text-[15px] leading-snug text-white sm:text-base">
        {recent.map((c) => (
          <p key={c.id}>
            <span className="font-semibold text-white/70">{c.user?.name || "Speaker"}: </span>
            {c.text}
          </p>
        ))}
      </div>
    </div>
  );
});
