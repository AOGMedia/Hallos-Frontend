"use client";

import { memo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ParticipantView,
  SfuModels,
  hasAudio,
  useParticipantViewContext,
  type StreamVideoParticipant,
  type VideoPlaceholderProps,
} from "@stream-io/video-react-sdk";
import { MicOff, MonitorUp, MoreVertical, Pin, PinOff, Sparkles, UserX } from "lucide-react";
import { RoomAvatar } from "./RoomAvatar";
import { ConnectionBars, HandBadge, SpeakingBars } from "./RoomIndicators";
import { useTileActions } from "./TileActions";
import { Sheet } from "./Sheet";

const HOST_CALL_ROLE = "admin";
const LONG_PRESS_MS = 450;

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
 * Name, mic/speaking, connection and raised-hand badges drawn over each tile.
 * Plain translucent backgrounds (no blur): blur on every tile is costly on phones.
 */
function TileOverlay({
  isHost,
  handPosition,
  onOpenMenu,
}: {
  isHost: boolean;
  handPosition?: number;
  onOpenMenu?: () => void;
}) {
  const { participant, trackType } = useParticipantViewContext();
  const muted = !hasAudio(participant);
  const isScreen = trackType === "screenShareTrack";
  const name = participant.isLocalParticipant ? "You" : participant.name || "Guest";
  const weak = participant.connectionQuality === SfuModels.ConnectionQuality.POOR;

  return (
    <>
      {participant.isSpeaking && !isScreen && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary ring-inset" />
      )}
      {handPosition !== undefined && !isScreen && <HandBadge position={handPosition} className="absolute right-2 top-2" />}
      {onOpenMenu && (
        <button
          type="button"
          aria-label={`Options for ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu();
          }}
          className={`absolute ${handPosition !== undefined && !isScreen ? "right-2 top-12" : "right-2 top-2"} hidden h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 md:flex`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
        {isScreen && <MonitorUp className="h-3.5 w-3.5 shrink-0" />}
        {!isScreen &&
          (muted ? (
            <MicOff className="h-3.5 w-3.5 shrink-0 text-red-400" />
          ) : participant.isSpeaking ? (
            <SpeakingBars className="shrink-0 text-primary" />
          ) : null)}
        {weak && !isScreen && <ConnectionBars level={1} />}
        <span className="truncate">{isScreen ? `${name} is presenting` : name}</span>
        {isHost && !isScreen && (
          <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">Host</span>
        )}
        {participant.pin && !isScreen && <Pin className="h-3 w-3 shrink-0 text-white/70" aria-label="Pinned" />}
      </div>
    </>
  );
}

/** Pin / spotlight / mute / remove for one person. Desktop: small menu; phones: bottom sheet. */
function TileMenu({ participant, open, onClose }: { participant: StreamVideoParticipant; open: boolean; onClose: () => void }) {
  const actions = useTileActions();
  if (!actions || !open) return null;
  const isHostTile = Boolean(participant.roles?.includes(HOST_CALL_ROLE));
  const name = participant.isLocalParticipant ? "You" : participant.name || "Guest";
  const spotlighted = actions.spotlightUserId === participant.userId;

  const items: { key: string; label: string; icon: React.ReactNode; danger?: boolean; run: () => void }[] = [
    {
      key: "pin",
      label: participant.pin ? "Unpin" : "Pin for me",
      icon: participant.pin ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />,
      run: () => actions.onPin(participant),
    },
  ];
  if (actions.canModerate) {
    items.push({
      key: "spotlight",
      label: spotlighted ? "Remove spotlight" : "Spotlight for everyone",
      icon: <Sparkles className="h-4 w-4" />,
      run: () => actions.onSpotlight(participant),
    });
    if (!participant.isLocalParticipant && hasAudio(participant)) {
      items.push({ key: "mute", label: `Mute ${name}`, icon: <MicOff className="h-4 w-4" />, run: () => actions.onMute(participant) });
    }
    if (!participant.isLocalParticipant && !isHostTile) {
      items.push({
        key: "remove",
        label: `Remove ${name}`,
        icon: <UserX className="h-4 w-4" />,
        danger: true,
        run: () => actions.onRemove(participant),
      });
    }
  }

  const list = (
    <ul className="space-y-1 p-2">
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            onClick={() => {
              item.run();
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition hover:bg-white/10 ${
              item.danger ? "text-red-300" : "text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );

  // Portal: taps in the menu must not reach the tile (long-press / tap handlers).
  return createPortal(
    <Sheet open onClose={onClose} title={name} mobileHeight="max-h-[60dvh]">
      <div className="pb-[max(env(safe-area-inset-bottom),12px)]">{list}</div>
    </Sheet>,
    document.body
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
 * Long-press (phones) or the ⋮ button (desktop) opens its menu.
 */
export const ParticipantTile = memo(function ParticipantTile({
  participant,
  isHost,
  handPosition,
  screen = false,
  className = "",
}: ParticipantTileProps) {
  const actions = useTileActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const longPressed = useRef(false);

  const startPress = (e: React.PointerEvent) => {
    if (!actions || screen || e.pointerType === "mouse") return;
    longPressed.current = false;
    clearTimeout(press.current);
    press.current = setTimeout(() => {
      longPressed.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
      setMenuOpen(true);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => clearTimeout(press.current);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#151a27] ${screen ? "hallos-screen bg-black" : ""} ${className}`}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClickCapture={(e) => {
        // A long-press shouldn't also count as a tap (which toggles the controls).
        if (longPressed.current) {
          e.stopPropagation();
          longPressed.current = false;
        }
      }}
      onContextMenu={(e) => {
        if (actions && !screen) e.preventDefault();
      }}
    >
      <ParticipantView
        participant={participant}
        trackType={screen ? "screenShareTrack" : "videoTrack"}
        muteAudio
        mirror={participant.isLocalParticipant && !screen ? true : undefined}
        VideoPlaceholder={Placeholder}
        ParticipantViewUI={
          <TileOverlay
            isHost={isHost}
            handPosition={handPosition}
            onOpenMenu={actions && !screen ? () => setMenuOpen(true) : undefined}
          />
        }
        className="!h-full !w-full"
      />
      {menuOpen && <TileMenu participant={participant} open={menuOpen} onClose={() => setMenuOpen(false)} />}
    </div>
  );
});
