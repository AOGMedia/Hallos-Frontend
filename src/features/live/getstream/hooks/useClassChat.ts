"use client";

import { useCallback, useEffect, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { CHAT_EVENT, MAX_CHAT_LENGTH, newEventId, type ChatEventPayload } from "../lib/events";

export interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  text: string;
  sentAt: number;
  mine: boolean;
  /** Set while our own message is still being delivered, or if it failed. */
  status?: "sending" | "failed";
}

const MAX_MESSAGES = 200;

/**
 * Live chat for the class. Own messages show immediately (optimistically);
 * everyone else's arrive as custom call events.
 */
export function useClassChat({ selfId, selfName, isOpen }: { selfId: string; selfName: string; isOpen: boolean }) {
  const call = useCall();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);

  const append = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), message]);
  }, []);

  useEffect(() => {
    if (!call) return;
    return call.on("custom", (event) => {
      const payload = event.custom as Partial<ChatEventPayload> | undefined;
      if (payload?.kind !== CHAT_EVENT || !payload.text || !payload.id) return;
      if (event.user?.id === selfId) return; // already shown optimistically
      append({
        id: payload.id,
        userId: event.user?.id ?? "",
        name: (event.user as { name?: string } | undefined)?.name || "Guest",
        text: String(payload.text).slice(0, MAX_CHAT_LENGTH),
        sentAt: Date.parse(event.created_at) || Date.now(),
        mine: false,
      });
      setUnread((n) => n + 1);
    });
  }, [call, selfId, append]);

  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen, messages.length]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_CHAT_LENGTH);
      if (!call || !text) return;
      const id = newEventId();
      append({ id, userId: selfId, name: selfName, text, sentAt: Date.now(), mine: true, status: "sending" });
      const payload: ChatEventPayload = { kind: CHAT_EVENT, id, text };
      const setStatus = (status?: ChatMessage["status"]) =>
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      try {
        await call.sendCustomEvent(payload);
        setStatus(undefined);
      } catch {
        setStatus("failed");
      }
    },
    [call, selfId, selfName, append]
  );

  const retry = useCallback(
    async (message: ChatMessage) => {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      await send(message.text);
    },
    [send]
  );

  return { messages, unread: isOpen ? 0 : unread, send, retry };
}
