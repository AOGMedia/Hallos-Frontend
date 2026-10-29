"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import {
  CHAT_EVENT,
  MAX_CHAT_LENGTH,
  SYSTEM_USER_ID,
  isSafePhotoUrl,
  newEventId,
  type ChatEventPayload,
  type PhotoEventPayload,
} from "../lib/events";
import { MAX_UPLOAD_BYTES, preparePhoto } from "../lib/image";
import { friendlyError } from "../lib/errors";
import { shareChatPhoto, type GetStreamTarget } from "../api";

export interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  text: string;
  sentAt: number;
  mine: boolean;
  /** A shared photo (a local preview while our own upload is in flight). */
  photoUrl?: string;
  /** 0–1 while our own photo uploads. */
  progress?: number;
  /** A line from Hallos itself, e.g. "Ada sent a Rose 🌹". */
  system?: boolean;
  /** Set while our own message is still being delivered, or if it failed. */
  status?: "sending" | "failed";
  error?: string;
}

const MAX_MESSAGES = 200;

/**
 * Live chat for the class: text from everyone (custom call events), photos
 * (uploaded to our server, which announces them as the Hallos system user)
 * and system lines. Own messages show immediately (optimistically).
 */
export function useClassChat({
  target,
  selfId,
  selfName,
  isOpen,
}: {
  target: GetStreamTarget;
  selfId: string;
  selfName: string;
  isOpen: boolean;
}) {
  const call = useCall();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  // Original files of photos that failed, so "retry" doesn't need a new pick.
  const pendingPhotos = useRef(new Map<string, { blob: Blob; caption: string }>());

  const append = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), message]);
  }, []);

  const patch = useCallback((id: string, changes: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }, []);

  useEffect(() => {
    if (!call) return;
    return call.on("custom", (event) => {
      const payload = event.custom as Partial<ChatEventPayload & PhotoEventPayload> | undefined;
      if (payload?.kind !== CHAT_EVENT || !payload.id) return;
      const sentAt = Date.parse(event.created_at) || Date.now();

      // Photos: only from the server, only https.
      if (payload.photo) {
        if (event.user?.id !== SYSTEM_USER_ID || !payload.from || !isSafePhotoUrl(payload.photo.url)) return;
        if (payload.from.id === selfId) return; // already shown optimistically
        append({
          id: payload.id,
          userId: payload.from.id,
          name: payload.from.name || "Guest",
          text: String(payload.text || "").slice(0, MAX_CHAT_LENGTH),
          photoUrl: payload.photo.url,
          sentAt,
          mine: false,
        });
        setUnread((n) => n + 1);
        return;
      }

      if (!payload.text) return;
      if (event.user?.id === selfId) return; // already shown optimistically
      append({
        id: payload.id,
        userId: event.user?.id ?? "",
        name: (event.user as { name?: string } | undefined)?.name || "Guest",
        text: String(payload.text).slice(0, MAX_CHAT_LENGTH),
        sentAt,
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
      try {
        await call.sendCustomEvent(payload);
        patch(id, { status: undefined });
      } catch {
        patch(id, { status: "failed" });
      }
    },
    [call, selfId, selfName, append, patch]
  );

  // Local previews (object URLs) to free once they're no longer shown.
  const previews = useRef(new Map<string, string>());
  useEffect(() => {
    const map = previews.current;
    return () => map.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const uploadPhoto = useCallback(
    async (id: string, blob: Blob, caption: string) => {
      try {
        const { url } = await shareChatPhoto(target, blob, {
          caption,
          clientId: id,
          // Coarse steps only: fewer re-renders on slow phones.
          onProgress: (progress) => patch(id, { progress: Math.round(progress * 10) / 10 }),
        });
        pendingPhotos.current.delete(id);
        patch(id, { status: undefined, progress: undefined, photoUrl: url, error: undefined });
        const preview = previews.current.get(id);
        if (preview) {
          previews.current.delete(id);
          // Let the hosted image take over before freeing the local copy.
          setTimeout(() => URL.revokeObjectURL(preview), 5000);
        }
      } catch (error) {
        patch(id, {
          status: "failed",
          progress: undefined,
          error: friendlyError(error, "Your photo didn't send. Tap to try again."),
        });
      }
    },
    [target, patch]
  );

  /** Share a photo. Returns a message to show if it can't be sent at all, else null. */
  const sendPhoto = useCallback(
    async (file: File, rawCaption = ""): Promise<string | null> => {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
        return "That file type isn't supported. Please share a JPG, PNG, WebP or GIF photo.";
      }
      const caption = rawCaption.trim().slice(0, MAX_CHAT_LENGTH);
      const id = newEventId();
      const blob = await preparePhoto(file);
      if (blob.size > MAX_UPLOAD_BYTES) return "That photo is too large. Please choose one under 5 MB.";
      pendingPhotos.current.set(id, { blob, caption });
      const preview = URL.createObjectURL(blob);
      previews.current.set(id, preview);
      append({
        id,
        userId: selfId,
        name: selfName,
        text: caption,
        photoUrl: preview,
        progress: 0,
        sentAt: Date.now(),
        mine: true,
        status: "sending",
      });
      await uploadPhoto(id, blob, caption);
      return null;
    },
    [selfId, selfName, append, uploadPhoto]
  );

  const retry = useCallback(
    async (message: ChatMessage) => {
      const photo = pendingPhotos.current.get(message.id);
      if (photo) {
        patch(message.id, { status: "sending", progress: 0, error: undefined });
        await uploadPhoto(message.id, photo.blob, photo.caption);
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      await send(message.text);
    },
    [send, uploadPhoto, patch]
  );

  /** A line from Hallos (gifts). Counts as unread like any message. */
  const addSystemLine = useCallback(
    (id: string, text: string) => {
      append({ id, userId: SYSTEM_USER_ID, name: "Hallos", text, sentAt: Date.now(), mine: false, system: true });
      setUnread((n) => n + 1);
    },
    [append]
  );

  return { messages, unread: isOpen ? 0 : unread, send, sendPhoto, retry, addSystemLine };
}
