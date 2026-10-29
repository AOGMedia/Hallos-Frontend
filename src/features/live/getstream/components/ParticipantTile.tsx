"use client";

import { memo } from "react";
import {
  ParticipantView,
  hasAudio,
  useParticipantViewContext,
  type StreamVideoParticipant,
  type VideoPlaceholderProps,
} from "@stream-io/video-react-sdk";
import { Hand, MicOff, MonitorUp } from "lucide-react";
import { RoomAvatar } from "./RoomAvatar";

/**
 * Camera off, Google Meet style: their profile picture (or initial) as a big
 * circle in the middle of a dark tile, glowing while they speak.
 */
function Placeholder({ participant }: VideoPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1b2030]">
      <RoomAvatar
        name={participant.name || participant.userId}
        image={participant.image}
        speaking={participant.isSpeaking}
        className="aspect-square w-[34%] min-w-12 max-w-36 text-xl ring-1 ring-white/10 sm:text-3xl"
      />
    </div>
  );
}

/**
 * Name, mic and raised-hand badges drawn over each video tile. Plain
 * translucent backgrounds (no blur): blur on every tile is costly on phones.
 */
function TileOverlay({ isHost, handPosition }: { isHost: boolean; handPosition?: number }) {
  const { participant, trackType } = useParticipantViewContext();
  const muted = !hasAudio(participant);
  const isScreen = trackType === "screenShareTrack";
  const name = participant.isLocalParticipant ? "You" : participant.name || "Guest";

  return (
    <>
      {participant.isSpeaking && !isScreen && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary ring-inset" />
      )}
      {handPosition !== undefined && !isScreen && (
        <div
          className="absolute right-2 top-2 flex h-8 items-center gap-1 rounded-full bg-amber-400 px-2.5 text-xs font-bold text-black shadow-lg"
          aria-label={`Hand raised, number ${handPosition} in line`}
        >
          <Hand className="h-4 w-4" />
          {handPosition}
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
        {isScreen && <MonitorUp className="h-3.5 w-3.5 shrink-0" />}
        {muted && !isScreen && <MicOff className="h-3.5 w-3.5 shrink-0 text-red-400" />}
        <span className="truncate">{isScreen ? `${name} is presenting` : name}</span>
        {isHost && !isScreen && (
          <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">
            Host
          </span>
        )}
      </div>
    </>
  );
}

interface ParticipantTileProps {
  participant: StreamVideoParticipant;
  isHost: boolean;
  /** Place in the raised-hands queue (1 = first), if their hand is up. */
  handPosition?: number;
  screen?: boolean;
  className?: string;
}

/**
 * One video tile. Audio is played separately (RemoteAudio), so tiles can
 * scroll off-screen; the SDK only downloads video for tiles in view.
 */
export const ParticipantTile = memo(function ParticipantTile({
  participant,
  isHost,
  handPosition,
  screen = false,
  className = "",
}: ParticipantTileProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#151a27] ${className}`}>
      <ParticipantView
        participant={participant}
        trackType={screen ? "screenShareTrack" : "videoTrack"}
        muteAudio
        mirror={participant.isLocalParticipant && !screen ? true : undefined}
        VideoPlaceholder={Placeholder}
        ParticipantViewUI={<TileOverlay isHost={isHost} handPosition={handPosition} />}
        className="!h-full !w-full"
      />
    </div>
  );
});
