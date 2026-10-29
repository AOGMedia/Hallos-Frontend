"use client";

import { memo, useState, type ReactNode } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import {
  Gift,
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  SmilePlus,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react";
import { REACTIONS } from "../lib/events";
import { tapHaptic } from "../lib/haptics";
import type { ReactionCode } from "../hooks/useReactions";
import { Sheet } from "./Sheet";

/**
 * The familiar record symbol: a ring with a red dot to start; a red stop
 * square while recording.
 */
function RecordIcon({ recording }: { recording: boolean }) {
  return recording ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2.5" fill="#ef4444" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.5" fill="#ef4444" />
    </svg>
  );
}

function ControlButton({
  label,
  active = true,
  danger = false,
  highlight = false,
  badge,
  className = "",
  onClick,
  disabled,
  children,
}: {
  label: string;
  active?: boolean;
  danger?: boolean;
  highlight?: boolean;
  badge?: number;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const tone = danger
    ? "bg-red-500 text-white hover:bg-red-600"
    : highlight
      ? "bg-primary text-white"
      : active
        ? "bg-white/10 text-white hover:bg-white/15"
        : "bg-white text-[#141a28]";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => {
        tapHaptic();
        onClick();
      }}
      // touch-manipulation: no double-tap-zoom delay on phones.
      className={`relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full transition active:scale-90 disabled:opacity-40 sm:h-[52px] sm:w-[52px] ${tone} ${className}`}
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[#0d111b]">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

export interface ControlBarProps {
  /** Creator or co-host: sees raised hands instead of a raise-hand button. */
  isHost: boolean;
  /** Only the creator controls recording (the backend enforces this too). */
  canRecord: boolean;
  /** Attendees can gift the host. */
  canGift: boolean;
  chatOpen: boolean;
  unread: number;
  handRaised: boolean;
  raisedCount: number;
  recording: boolean;
  recordingBusy: boolean;
  onToggleChat: () => void;
  onReact: (code: ReactionCode) => void;
  onToggleHand: () => void;
  onOpenHands: () => void;
  onOpenGifts: () => void;
  onToggleRecording: () => void;
  onLeave: () => void;
  onDeviceError: (message: string) => void;
}

/**
 * Bottom controls, sized and spaced for thumbs.
 * Phones: mic · camera · hand · gift · chat · more · leave (fits 360px wide).
 * Larger screens: everything inline, plus screen share and reactions.
 */
export const ControlBar = memo(function ControlBar(props: ControlBarProps) {
  const call = useCall();
  const { useCameraState, useMicrophoneState, useScreenShareState } = useCallStateHooks();
  const { optimisticIsMute: camOff } = useCameraState();
  const { optimisticIsMute: micOff } = useMicrophoneState();
  const { optimisticIsMute: notSharing } = useScreenShareState();
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const run = (action: Promise<void> | undefined, what: string) =>
    action?.catch(() =>
      props.onDeviceError(`We couldn't turn on your ${what}. Check that Hallos is allowed to use it in your browser settings.`)
    );

  const reactionButtons = (onPicked?: () => void) =>
    REACTIONS.map((r) => (
      <button
        key={r.code}
        type="button"
        aria-label={r.label}
        onClick={() => {
          tapHaptic(8);
          props.onReact(r.code);
          onPicked?.();
        }}
        className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-full text-[1.75rem] transition hover:bg-white/10 active:scale-125"
      >
        {r.emoji}
      </button>
    ));

  return (
    <div className="relative z-30 shrink-0 border-t border-white/5 bg-[#0d111b] px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 md:bg-[#0d111b]/90 md:backdrop-blur-xl">
      {reactionsOpen && (
        <div className="absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-[#1b2234] p-1.5 shadow-2xl md:flex">
          {reactionButtons()}
        </div>
      )}

      {/* Centred when it fits; scrolls sideways on the narrowest phones instead of clipping. */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex w-max items-center gap-1 sm:gap-3">
        <ControlButton
          label={micOff ? "Turn microphone on" : "Turn microphone off"}
          active={!micOff}
          onClick={() => run(call?.microphone.toggle(), "microphone")}
        >
          {micOff ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </ControlButton>
        <ControlButton
          label={camOff ? "Turn camera on" : "Turn camera off"}
          active={!camOff}
          onClick={() => run(call?.camera.toggle(), "camera")}
        >
          {camOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </ControlButton>
        <ControlButton
          label={notSharing ? "Share your screen" : "Stop sharing"}
          highlight={!notSharing}
          className="!hidden md:!flex"
          onClick={() => run(call?.screenShare.toggle(), "screen share")}
        >
          <MonitorUp className="h-5 w-5" />
        </ControlButton>
        <ControlButton
          label="Reactions"
          highlight={reactionsOpen}
          className="!hidden md:!flex"
          onClick={() => setReactionsOpen((v) => !v)}
        >
          <SmilePlus className="h-5 w-5" />
        </ControlButton>

        {props.isHost ? (
          <ControlButton
            label={`Raised hands${props.raisedCount ? ` (${props.raisedCount})` : ""}`}
            highlight={props.raisedCount > 0}
            badge={props.raisedCount}
            onClick={props.onOpenHands}
          >
            <Hand className="h-5 w-5" />
          </ControlButton>
        ) : (
          <ControlButton
            label={props.handRaised ? "Lower hand" : "Raise hand"}
            highlight={props.handRaised}
            onClick={props.onToggleHand}
          >
            <Hand className="h-5 w-5" />
          </ControlButton>
        )}

        {props.canGift && (
          <ControlButton label="Send a gift" onClick={props.onOpenGifts} className="!bg-gradient-to-br !from-amber-400 !to-pink-500 !text-white">
            <Gift className="h-5 w-5" />
          </ControlButton>
        )}

        {props.canRecord && (
          <ControlButton
            label={props.recording ? "Stop recording" : "Start recording"}
            disabled={props.recordingBusy}
            className={`!hidden md:!flex ${props.recording ? "!bg-red-500/15 ring-2 ring-red-500/60" : ""}`}
            onClick={props.onToggleRecording}
          >
            <RecordIcon recording={props.recording} />
          </ControlButton>
        )}

        <ControlButton label="Chat" highlight={props.chatOpen} badge={props.chatOpen ? 0 : props.unread} onClick={props.onToggleChat}>
          <MessageCircle className="h-5 w-5" />
        </ControlButton>

        <ControlButton label="More" className="md:!hidden" onClick={() => setMoreOpen(true)}>
          <MoreHorizontal className="h-5 w-5" />
        </ControlButton>

        <ControlButton label="Leave class" danger className="!w-12 sm:!w-20" onClick={props.onLeave}>
          <PhoneOff className="h-5 w-5" />
        </ControlButton>
      </div>
      </div>

      {/* Phones: everything that doesn't fit in the bar */}
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More" mobileHeight="max-h-[70dvh]">
        <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/50">React</p>
          <div className="mb-4 flex flex-wrap justify-between">{reactionButtons(() => setMoreOpen(false))}</div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={camOff}
              onClick={() => {
                run(call?.camera.flip(), "camera");
                setMoreOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/5 px-4 py-3.5 text-left text-sm font-medium disabled:opacity-40"
            >
              <SwitchCamera className="h-5 w-5" /> Switch camera
              {camOff && <span className="ml-auto text-xs text-white/40">Camera is off</span>}
            </button>
            {props.canRecord && (
              <button
                type="button"
                disabled={props.recordingBusy}
                onClick={() => {
                  props.onToggleRecording();
                  setMoreOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/5 px-4 py-3.5 text-left text-sm font-medium disabled:opacity-40"
              >
                <RecordIcon recording={props.recording} />
                {props.recording ? "Stop recording" : "Start recording"}
              </button>
            )}
          </div>
        </div>
      </Sheet>
    </div>
  );
});
