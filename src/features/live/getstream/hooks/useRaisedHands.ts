"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { HAND_EVENT, type HandEventPayload } from "../lib/events";

export interface RaisedHand {
  userId: string;
  name: string;
  /** Profile picture (null => their initial). */
  image?: string | null;
  raisedAt: number;
}

const LOWER_ALL = "*";

/**
 * Raise hand, Google Meet style:
 *   - a queue in the order hands went up (everyone sees their place),
 *   - hosts can lower one person's hand or everyone's,
 *   - people who join later still see raised hands (raised hands are
 *     re-announced when someone joins),
 *   - hands of people who leave disappear.
 * Lowering someone else's hand is only accepted from a host.
 */
export function useRaisedHands({
  selfId,
  selfName,
  hostUserIds,
  onRaised,
  onLoweredByHost,
}: {
  selfId: string;
  selfName: string;
  hostUserIds: ReadonlySet<string>;
  /** Someone else raised their hand (hosts use it for a sound + toast). */
  onRaised?: (hand: RaisedHand) => void;
  /** A host lowered this user's hand. */
  onLoweredByHost?: () => void;
}) {
  const call = useCall();
  const [hands, setHands] = useState<Map<string, RaisedHand>>(new Map());
  // Source of truth, readable synchronously inside event listeners.
  const handsRef = useRef<Map<string, RaisedHand>>(new Map());

  // Latest values for the event listener, without re-subscribing.
  const latest = useRef({ hostUserIds, onRaised, onLoweredByHost });
  latest.current.hostUserIds = hostUserIds;
  latest.current.onRaised = onRaised;
  latest.current.onLoweredByHost = onLoweredByHost;

  const isRaised = hands.has(selfId);

  const update = useCallback((fn: (next: Map<string, RaisedHand>) => void) => {
    const next = new Map(handsRef.current);
    fn(next);
    handsRef.current = next;
    setHands(next);
  }, []);

  useEffect(() => {
    if (!call) return;
    const offCustom = call.on("custom", (event) => {
      const payload = event.custom as Partial<HandEventPayload> | undefined;
      const fromId = event.user?.id;
      if (payload?.kind !== HAND_EVENT || !fromId) return;

      // A host lowering someone else's (or everyone's) hand.
      if (payload.targetUserId) {
        const fromHost =
          latest.current.hostUserIds.has(fromId) ||
          call.state.participants.some((p) => p.userId === fromId && p.roles?.includes("admin"));
        if (!fromHost) return;
        const target = payload.targetUserId;
        const meLowered = (target === LOWER_ALL || target === selfId) && handsRef.current.has(selfId);
        update((next) => (target === LOWER_ALL ? next.clear() : void next.delete(target)));
        if (meLowered) latest.current.onLoweredByHost?.();
        return;
      }

      if (payload.raised) {
        const hand = {
          userId: fromId,
          name: (event.user as { name?: string } | undefined)?.name || "Someone",
          image: event.user?.image ?? null,
          raisedAt: Date.parse(event.created_at) || Date.now(),
        };
        // Re-announcements keep their original place in the queue.
        if (handsRef.current.has(fromId)) return;
        update((next) => void next.set(fromId, hand));
        if (fromId !== selfId) latest.current.onRaised?.(hand);
      } else {
        update((next) => void next.delete(fromId));
      }
    });

    // Someone joined: re-announce a raised hand so they see it too (with a
    // small random delay so a room full of hands doesn't fire at once).
    const offJoined = call.on("call.session_participant_joined", () => {
      if (!handsRef.current.has(selfId)) return;
      setTimeout(() => {
        if (!handsRef.current.has(selfId)) return;
        const payload: HandEventPayload = { kind: HAND_EVENT, raised: true };
        call.sendCustomEvent(payload).catch(() => {});
      }, 300 + Math.random() * 1500);
    });

    return () => {
      offCustom();
      offJoined();
    };
  }, [call, selfId, update]);

  // Forget the hand of someone who left (unless they're still in on another
  // device). Event-based on purpose: subscribing to the participant list here
  // would re-render the whole room every time someone starts speaking.
  useEffect(() => {
    if (!call) return;
    return call.on("call.session_participant_left", (event) => {
      const userId = event.participant?.user?.id;
      if (!userId || !handsRef.current.has(userId)) return;
      setTimeout(() => {
        const stillHere = call.state.participants.some((p) => p.userId === userId);
        if (!stillHere) update((next) => void next.delete(userId));
      }, 500);
    });
  }, [call, update]);

  const send = useCallback(
    (payload: HandEventPayload) => call?.sendCustomEvent(payload).then(() => true).catch(() => false) ?? Promise.resolve(false),
    [call]
  );

  /** Raise or lower your own hand. Returns false if it couldn't be sent. */
  const toggleHand = useCallback(async () => {
    const up = !isRaised;
    update((next) =>
      up ? void next.set(selfId, { userId: selfId, name: selfName, raisedAt: Date.now() }) : void next.delete(selfId)
    );
    const ok = await send({ kind: HAND_EVENT, raised: up });
    if (!ok) {
      // Put it back the way it was; the caller tells the user.
      update((next) =>
        up ? void next.delete(selfId) : void next.set(selfId, { userId: selfId, name: selfName, raisedAt: Date.now() })
      );
    }
    return ok;
  }, [isRaised, selfId, selfName, send, update]);

  /** Host: lower one person's hand. */
  const lowerHand = useCallback(
    async (userId: string) => {
      update((next) => void next.delete(userId));
      return send({ kind: HAND_EVENT, raised: false, targetUserId: userId });
    },
    [send, update]
  );

  /** Host: lower everyone's hand. */
  const lowerAll = useCallback(async () => {
    update((next) => next.clear());
    return send({ kind: HAND_EVENT, raised: false, targetUserId: LOWER_ALL });
  }, [send, update]);

  /** Raised hands, first raised first. */
  const queue = useMemo(() => [...hands.values()].sort((a, b) => a.raisedAt - b.raisedAt), [hands]);
  /** userId -> place in the queue (1-based). */
  const positions = useMemo(() => new Map(queue.map((h, i) => [h.userId, i + 1])), [queue]);

  return { queue, positions, isRaised, toggleHand, lowerHand, lowerAll };
}
