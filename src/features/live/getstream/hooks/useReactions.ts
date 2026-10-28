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

const FLOAT_MS = 2600;
const MAX_ON_SCREEN = 24;

/** Emoji reactions everyone sees float up over the stage. */
export function useReactions({ selfId, selfName }: { selfId: string; selfName: string }) {
  const call = useCall();
  const [floating, setFloating] = useState<FloatingReaction[]>([]);

  const show = useCallback((emoji: string, name: string) => {
    const reaction = { id: newEventId(), emoji, name, lane: Math.random() };
    setFloating((prev) => [...prev.slice(-(MAX_ON_SCREEN - 1)), reaction]);
    setTimeout(() => setFloating((prev) => prev.filter((r) => r.id !== reaction.id)), FLOAT_MS);
  }, []);

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

  const react = useCallback(
    (code: (typeof REACTIONS)[number]["code"]) => {
      const emoji = emojiFor(code);
      if (!emoji) return;
      show(emoji, selfName);
      const payload: ReactionEventPayload = { kind: REACTION_EVENT, code };
      call?.sendCustomEvent(payload).catch(() => {
        // Best-effort: a dropped reaction isn't worth an error message.
      });
    },
    [call, selfName, show]
  );

  return { floating, react, durationMs: FLOAT_MS };
}
