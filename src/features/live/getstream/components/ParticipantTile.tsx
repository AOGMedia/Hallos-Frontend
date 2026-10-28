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
import { initialsOf } from "../lib/events";

function Placeholder({ participant }: VideoPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#262f45] to-[#151a27]">
      <div className="flex aspect-square w-[28%] min-w-12 max-w-28 items-center justify-center rounded-full bg-primary/25 text-lg font-semibold text-white ring-1 ring-white/10 sm:text-2xl">
        {initialsOf(participant.name || participant.userId)}
      </div>
    </div>
  );
}

/** Name, mic and raised-hand badges drawn over each video tile. */
function TileOverlay({ isHost, handRaised }: { isHost: boolean; handRaised: boolean }) {
  const { participant, trackType } = useParticipantViewContext();
  const muted = !hasAudio(participant);
  const isScreen = trackType === "screenShareTrack";
  const name = participant.isLocalParticipant ? "You" : participant.name || "Guest";

  return (
    <>
      {participant.isSpeaking && !isScreen && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary ring-inset" />
      )}
      {handRaised && !isScreen && (
        <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg">
          <Hand className="h-4 w-4" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
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
  handRaised: boolean;
  screen?: boolean;
  className?: string;
}

/** One video tile. Audio is played separately (ParticipantsAudio), so tiles can scroll off-screen. */
export const ParticipantTile = memo(function ParticipantTile({
  participant,
  isHost,
  handRaised,
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
        ParticipantViewUI={<TileOverlay isHost={isHost} handRaised={handRaised} />}
        className="!h-full !w-full"
      />
    </div>
  );
});
