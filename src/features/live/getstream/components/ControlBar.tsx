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
  Settings,
  SmilePlus,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react";
import { tapHaptic } from "../lib/haptics";
import { SpeakingBars } from "./RoomIndicators";
import { Sheet } from "./Sheet";

/** Screen shares favour sharp text over motion (like Meet's "text" mode): fewer frames, more detail. */
const SCREEN_SHARE_SETTINGS = { maxFramerate: 15, maxBitrate: 2_500_000 };

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

/**
 * The mic button. Its own component because it follows your voice (speaking
 * bars, "you're muted" hint) — those updates stay inside this button.
 */
const MicButton = memo(function MicButton({ onError }: { onError: (what: string) => void }) {
  const call = useCall();
  const { useMicrophoneState, useLocalParticipant } = useCallStateHooks();
  const { optimisticIsMute: micOff, isSpeakingWhileMuted } = useMicrophoneState();
  const me = useLocalParticipant();
  const speaking = !micOff && Boolean(me?.isSpeaking);

  return (
    <div className="relative">
      {isSpeakingWhileMuted && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-max -translate-x-1/2 rounded-full bg-[#1f2537] px-3 py-1.5 text-xs font-medium text-white shadow-xl ring-1 ring-white/10">
          You&apos;re muted — tap to speak
        </span>
      )}
      <ControlButton
        label={micOff ? "Turn microphone on" : "Turn microphone off"}
        active={!micOff}
        onClick={() => call?.microphone.toggle().catch(() => onError("microphone"))}
      >
        {micOff ? <MicOff className="h-5 w-5" /> : speaking ? <SpeakingBars className="text-white" /> : <Mic className="h-5 w-5" />}
      </ControlButton>
    </div>
  );
});

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
  reactionsOpen: boolean;
  onToggleChat: () => void;
  onToggleReactions: () => void;
  onToggleHand: () => void;
  onOpenHands: () => void;
  onOpenGifts: () => void;
  onOpenSettings: () => void;
  onToggleRecording: () => void;
  onLeave: () => void;
  onDeviceError: (message: string) => void;
}

/**
 * Bottom controls, sized and spaced for thumbs.
 * Phones: mic · camera · hand · gift · chat · more · leave (fits 360px wide).
 * Larger screens: everything inline, plus screen share, reactions and settings.
 */
export const ControlBar = memo(function ControlBar(props: ControlBarProps) {
  const call = useCall();
  const { useCameraState, useScreenShareState } = useCallStateHooks();
  const { optimisticIsMute: camOff } = useCameraState();
  const { optimisticIsMute: notSharing } = useScreenShareState();
  const [moreOpen, setMoreOpen] = useState(false);

  const deviceError = (what: string) =>
    props.onDeviceError(`We couldn't turn on your ${what}. Check that Hallos is allowed to use it in your browser settings.`);

  const toggleScreenShare = () => {
    if (!call) return;
    if (notSharing) call.screenShare.setSettings(SCREEN_SHARE_SETTINGS);
    call.screenShare.toggle().catch(() => deviceError("screen share"));
  };

  return (
    <div className="relative z-30 shrink-0 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 max-md:bg-gradient-to-t max-md:from-black/85 max-md:via-black/60 max-md:to-transparent max-md:pt-6 md:border-t md:border-white/5 md:bg-[#0d111b]/90 md:backdrop-blur-xl">
      {/* Centred when it fits; scrolls sideways on the narrowest phones instead of clipping. */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max items-center gap-1 sm:gap-3">
          <MicButton onError={deviceError} />
          <ControlButton
            label={camOff ? "Turn camera on" : "Turn camera off"}
            active={!camOff}
            onClick={() => call?.camera.toggle().catch(() => deviceError("camera"))}
          >
            {camOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </ControlButton>
          <ControlButton
            label={notSharing ? "Share your screen" : "Stop sharing"}
            highlight={!notSharing}
            className="!hidden md:!flex"
            onClick={toggleScreenShare}
          >
            <MonitorUp className="h-5 w-5" />
          </ControlButton>
          <ControlButton label="Reactions" highlight={props.reactionsOpen} className="!hidden md:!flex" onClick={props.onToggleReactions}>
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
              className={props.handRaised ? "!bg-amber-400 !text-black" : ""}
              onClick={props.onToggleHand}
            >
              <Hand className={`h-5 w-5 ${props.handRaised ? "hallos-wave" : ""}`} />
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

          <ControlButton label="Settings" className="!hidden md:!flex" onClick={props.onOpenSettings}>
            <Settings className="h-5 w-5" />
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
        <div className="space-y-2 px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
          <MoreItem
            icon={<SmilePlus className="h-5 w-5" />}
            label="Reactions"
            onClick={() => {
              setMoreOpen(false);
              props.onToggleReactions();
            }}
          />
          <MoreItem
            icon={<SwitchCamera className="h-5 w-5" />}
            label="Switch camera"
            hint={camOff ? "Camera is off" : undefined}
            disabled={camOff}
            onClick={() => {
              call?.camera.flip().catch(() => deviceError("camera"));
              setMoreOpen(false);
            }}
          />
          {props.canRecord && (
            <MoreItem
              icon={<RecordIcon recording={props.recording} />}
              label={props.recording ? "Stop recording" : "Start recording"}
              disabled={props.recordingBusy}
              onClick={() => {
                props.onToggleRecording();
                setMoreOpen(false);
              }}
            />
          )}
          <MoreItem
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            hint="Devices, background, layout, captions"
            onClick={() => {
              setMoreOpen(false);
              props.onOpenSettings();
            }}
          />
        </div>
      </Sheet>
    </div>
  );
});

function MoreItem({
  icon,
  label,
  hint,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        tapHaptic(8);
        onClick();
      }}
      className="flex w-full touch-manipulation items-center gap-3 rounded-2xl bg-white/5 px-4 py-3.5 text-left text-sm font-medium transition active:scale-[0.99] disabled:opacity-40"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block">{label}</span>
        {hint && <span className="block text-xs font-normal text-white/50">{hint}</span>}
      </span>
    </button>
  );
}
