"use client";

import { createContext, useContext } from "react";
import type { StreamVideoParticipant } from "@stream-io/video-react-sdk";

/**
 * What can be done to a tile (pin, spotlight, mute, remove). Provided once by
 * the room so tiles don't need these passed through every layer, and memoized
 * tiles don't re-render when unrelated room state changes.
 */
export interface TileActionsValue {
  canModerate: boolean;
  spotlightUserId: string | null;
  /** Host or co-host right now (follows live role changes). */
  isHostUser?: (p: StreamVideoParticipant) => boolean;
  onPin: (p: StreamVideoParticipant) => void;
  onSpotlight: (p: StreamVideoParticipant) => void;
  onMute: (p: StreamVideoParticipant) => void;
  onRemove: (p: StreamVideoParticipant) => void;
  /** Creator only: make someone a co-host or remove the role. Absent for everyone else. */
  cohost?: {
    isCohost: (p: StreamVideoParticipant) => boolean;
    set: (p: StreamVideoParticipant, makeHost: boolean) => void;
  };
}

export const TileActionsContext = createContext<TileActionsValue | null>(null);

export function useTileActions() {
  return useContext(TileActionsContext);
}
