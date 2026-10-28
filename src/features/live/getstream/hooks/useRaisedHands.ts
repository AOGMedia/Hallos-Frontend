"use client";

import { useCallback, useEffect, useState } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { HAND_EVENT, type HandEventPayload } from "../lib/events";

/**
 * Raise hand: participants toggle it, everyone sees it on their tile and the
 * host gets a count. Hands of people who leave are dropped automatically.
 */
export function useRaisedHands({ selfId }: { selfId: string }) {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [raised, setRaised] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!call) return;
    return call.on("custom", (event) => {
      const payload = event.custom as Partial<HandEventPayload> | undefined;
      const userId = event.user?.id;
      if (payload?.kind !== HAND_EVENT || !userId) return;
      setRaised((prev) => {
        const next = new Set(prev);
        if (payload.raised) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });
  }, [call]);

  // Forget hands of people no longer in the class.
  const presentIds = participants.map((p) => p.userId).join(",");
  useEffect(() => {
    const present = new Set(presentIds.split(","));
    setRaised((prev) => {
      const next = new Set([...prev].filter((id) => present.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [presentIds]);

  const isRaised = raised.has(selfId);

  const setHand = useCallback(
    async (up: boolean) => {
      if (!call) return;
      setRaised((prev) => {
        const next = new Set(prev);
        if (up) next.add(selfId);
        else next.delete(selfId);
        return next;
      });
      const payload: HandEventPayload = { kind: HAND_EVENT, raised: up };
      await call.sendCustomEvent(payload).catch(() => {});
    },
    [call, selfId]
  );

  return { raised, isRaised, toggleHand: () => setHand(!isRaised) };
}
