"use client";

import { useState, type ReactNode } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import {
  Circle,
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  SmilePlus,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react";
import { REACTIONS } from "../lib/events";
import { tapHaptic } from "../lib/haptics";

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
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-40 sm:h-[52px] sm:w-[52px] ${tone} ${className}`}
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

interface ControlBarProps {
  /** Creator or co-host: sees raised hands instead of a raise-hand button. */
  isHost: boolean;
  /** Only the creator controls recording (the backend enforces this too). */
  canRecord: boolean;
  chatOpen: boolean;
  unread: number;
  handRaised: boolean;
  raisedCount: number;
  recording: boolean;
  recordingBusy: boolean;
  onToggleChat: () => void;
  onReact: (code: (typeof REACTIONS)[number]["code"]) => void;
  onToggleHand: () => void;
  onToggleRecording: () => void;
  onLeave: () => void;
}

/** Bottom controls, sized and spaced for thumbs; desktop-only actions hide on phones. */
export function ControlBar(props: ControlBarProps) {
  const call = useCall();
  const { useCameraState, useMicrophoneState, useScreenShareState } = useCallStateHooks();
  const { optimisticIsMute: camOff } = useCameraState();
  const { optimisticIsMute: micOff } = useMicrophoneState();
  const { optimisticIsMute: notSharing } = useScreenShareState();
  const [reactionsOpen, setReactionsOpen] = useState(false);

  // Permission prompts can be declined — that just leaves the device off.
  const run = (action?: Promise<void>) => action?.catch((e) => console.warn("[GetStreamRoom] device toggle failed", e));

  return (
    <div className="relative z-30 shrink-0 border-t border-white/5 bg-[#0d111b]/90 px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-xl">
      {reactionsOpen && (
        <div className="absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-[#1b2234]/95 p-1.5 shadow-2xl backdrop-blur-xl">
          {REACTIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              aria-label={r.label}
              onClick={() => {
                tapHaptic(8);
                props.onReact(r.code);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-2xl transition hover:bg-white/10 active:scale-125"
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 overflow-x-auto [scrollbar-width:none] sm:gap-3">
        <ControlButton label={micOff ? "Turn microphone on" : "Turn microphone off"} active={!micOff} onClick={() => run(call?.microphone.toggle())}>
          {micOff ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </ControlButton>
        <ControlButton label={camOff ? "Turn camera on" : "Turn camera off"} active={!camOff} onClick={() => run(call?.camera.toggle())}>
          {camOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </ControlButton>
        <ControlButton label="Switch camera" className="md:hidden" disabled={camOff} onClick={() => run(call?.camera.flip())}>
          <SwitchCamera className="h-5 w-5" />
        </ControlButton>
        <ControlButton
          label={notSharing ? "Share your screen" : "Stop sharing"}
          highlight={!notSharing}
          className="hidden md:flex"
          onClick={() => run(call?.screenShare.toggle())}
        >
          <MonitorUp className="h-5 w-5" />
        </ControlButton>
        <ControlButton label="Reactions" highlight={reactionsOpen} onClick={() => setReactionsOpen((v) => !v)}>
          <SmilePlus className="h-5 w-5" />
        </ControlButton>
        {props.canRecord && (
          <ControlButton
            label={props.recording ? "Stop recording" : "Start recording"}
            highlight={props.recording}
            disabled={props.recordingBusy}
            onClick={props.onToggleRecording}
          >
            <Circle className={`h-5 w-5 ${props.recording ? "animate-pulse fill-red-500 text-red-500" : ""}`} />
          </ControlButton>
        )}
        {!props.isHost && (
          <ControlButton label={props.handRaised ? "Lower hand" : "Raise hand"} highlight={props.handRaised} onClick={props.onToggleHand}>
            <Hand className="h-5 w-5" />
          </ControlButton>
        )}
        <ControlButton
          label="Chat"
          highlight={props.chatOpen}
          badge={props.chatOpen ? 0 : props.unread}
          onClick={props.onToggleChat}
        >
          <MessageCircle className="h-5 w-5" />
        </ControlButton>
        {props.isHost && props.raisedCount > 0 && (
          <span className="flex h-12 shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-3 text-sm font-semibold text-amber-300">
            <Hand className="h-4 w-4" /> {props.raisedCount}
          </span>
        )}
        <ControlButton label="Leave class" danger className="!w-16 sm:!w-20" onClick={props.onLeave}>
          <PhoneOff className="h-5 w-5" />
        </ControlButton>
      </div>
    </div>
  );
}
