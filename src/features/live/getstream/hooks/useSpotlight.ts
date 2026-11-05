"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { SPOTLIGHT_EVENT, type SpotlightEventPayload } from "../lib/events";

const HOST_CALL_ROLE = "admin";

/**
 * "Spotlight for everyone": a host puts one person in the main view on every
 * screen. Only accepted from hosts; re-announced when someone joins so late
 * arrivals see the same thing.
 */
export function useSpotlight({ isHost, hostUserIds }: { isHost: boolean; hostUserIds: ReadonlySet<string> }) {
  const call = useCall();
  const [spotlightUserId, setSpotlightUserId] = useState<string | null>(null);
  const current = useRef<string | null>(null);
  const hosts = useRef(hostUserIds);
  hosts.current = hostUserIds;

  const apply = useCallback((userId: string | null) => {
    current.current = userId;
    setSpotlightUserId(userId);
  }, []);

  useEffect(() => {
    if (!call) return;
    const offCustom = call.on("custom", (event) => {
      const payload = event.custom as Partial<SpotlightEventPayload> | undefined;
      const fromId = event.user?.id;
      if (payload?.kind !== SPOTLIGHT_EVENT || !fromId) return;
      const fromHost =
        hosts.current.has(fromId) || call.state.participants.some((p) => p.userId === fromId && p.roles?.includes(HOST_CALL_ROLE));
      if (fromHost) apply(payload.userId ?? null);
    });
    const offJoined = call.on("call.session_participant_joined", () => {
      if (!isHost || !current.current) return;
      setTimeout(() => {
        if (!current.current) return;
        const payload: SpotlightEventPayload = { kind: SPOTLIGHT_EVENT, userId: current.current };
        call.sendCustomEvent(payload).catch(() => {});
      }, 600 + Math.random() * 900);
    });
    // The spotlighted person left: clear it.
    const offLeft = call.on("call.session_participant_left", (event) => {
      const userId = event.participant?.user?.id;
      if (userId && userId === current.current) {
        setTimeout(() => {
          if (!call.state.participants.some((p) => p.userId === userId)) apply(null);
        }, 500);
      }
    });
    return () => {
      offCustom();
      offJoined();
      offLeft();
    };
  }, [call, isHost, apply]);

  /** Host: spotlight someone for everyone (or clear it with null). Returns false if it couldn't be sent. */
  const spotlight = useCallback(
    async (userId: string | null) => {
      if (!call) return false;
      const previous = current.current;
      apply(userId);
      const payload: SpotlightEventPayload = { kind: SPOTLIGHT_EVENT, userId };
      try {
        await call.sendCustomEvent(payload);
        return true;
      } catch {
        apply(previous);
        return false;
      }
    },
    [call, apply]
  );

  return { spotlightUserId, spotlight };
}
