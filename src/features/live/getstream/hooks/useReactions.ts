"use client";

import { useCallback, useEffect, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { emojiFor, newEventId, REACTION_EVENT, REACTIONS, type ReactionEventPayload } from "../lib/events";

export interface FloatingReaction {
  id: string;
  emoji: string;
  name: string;
  /** 0–1: horizontal start position, so bursts don't stack on one line. */
  lane: number;
}

export type ReactionCode = (typeof REACTIONS)[number]["code"];

/** In-room channel for our own reactions (others' arrive as call events). */
export type ReactionBus = EventTarget;
const LOCAL_REACTION = "local-reaction";

const FLOAT_MS = 2600;
// Fewer simultaneous emojis on phones keeps animation smooth on low-end devices.
const maxOnScreen = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 10 : 20;

/** Send a reaction (no state here, so sending never re-renders the room). */
export function useSendReaction(bus: ReactionBus) {
  const call = useCall();
  return useCallback(
    (code: ReactionCode) => {
      if (!emojiFor(code)) return;
      bus.dispatchEvent(new CustomEvent(LOCAL_REACTION, { detail: code }));
      const payload: ReactionEventPayload = { kind: REACTION_EVENT, code };
      call?.sendCustomEvent(payload).catch(() => {
        // Best-effort: a dropped reaction isn't worth an error message.
      });
    },
    [call, bus]
  );
}

/** The emojis currently floating up — used only by the overlay component. */
export function useFloatingReactions({ bus, selfId, selfName }: { bus: ReactionBus; selfId: string; selfName: string }) {
  const call = useCall();
  const [floating, setFloating] = useState<FloatingReaction[]>([]);

  const show = useCallback((emoji: string, name: string) => {
    const reaction = { id: newEventId(), emoji, name, lane: Math.random() };
    setFloating((prev) => [...prev.slice(-(maxOnScreen() - 1)), reaction]);
    setTimeout(() => setFloating((prev) => prev.filter((r) => r.id !== reaction.id)), FLOAT_MS);
  }, []);

  useEffect(() => {
    const onLocal = (e: Event) => {
      const emoji = emojiFor((e as CustomEvent<string>).detail);
      if (emoji) show(emoji, selfName);
    };
    bus.addEventListener(LOCAL_REACTION, onLocal);
    return () => bus.removeEventListener(LOCAL_REACTION, onLocal);
  }, [bus, selfName, show]);

  useEffect(() => {
    if (!call) return;
    return call.on("custom", (event) => {
      const payload = event.custom as Partial<ReactionEventPayload> | undefined;
      if (payload?.kind !== REACTION_EVENT) return;
      if (event.user?.id === selfId) return; // shown when sent
      const emoji = emojiFor(payload.code);
      if (emoji) show(emoji, (event.user as { name?: string } | undefined)?.name || "");
    });
  }, [call, selfId, show]);

  return { floating, durationMs: FLOAT_MS };
}
