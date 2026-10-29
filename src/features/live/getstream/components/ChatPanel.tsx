"use client";

import { memo, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ImagePlus, MessageCircle, SendHorizontal, X } from "lucide-react";
import { MAX_CHAT_LENGTH } from "../lib/events";
import { RoomAvatar } from "./RoomAvatar";
import { ACCEPTED_PHOTO_TYPES } from "../lib/image";
import type { ChatMessage } from "../hooks/useClassChat";
import { Sheet } from "./Sheet";

interface ChatPanelProps {
  open: boolean;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  /** Resolves to a message to show if the photo can't be sent, else null. */
  onSendPhoto: (file: File, caption: string) => Promise<string | null>;
  onRetry: (message: ChatMessage) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

function timeOf(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const LINK_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

/** Text with tappable links (http/https only; opens in a new tab, no referrer). */
function Linkified({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const start = match.index ?? 0;
    // Keep trailing punctuation out of the link: "see example.com." -> link + "."
    const raw = match[0].replace(/[.,!?;:)\]]+$/, "");
    if (start > last) parts.push(text.slice(last, start));
    const href = raw.startsWith("www.") ? `https://${raw}` : raw;
    parts.push(
      <a
        key={start}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        className="break-all font-medium underline underline-offset-2"
      >
        {raw}
      </a>
    );
    last = start + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Circular upload progress drawn over our own photo while it sends. */
function UploadRing({ progress }: { progress: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-label="Uploading">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0.05, progress))}
          transform="rotate(-90 22 22)"
        />
      </svg>
    </div>
  );
}

const MessageRow = memo(function MessageRow({
  message: m,
  onRetry,
  onOpenPhoto,
}: {
  message: ChatMessage;
  onRetry: (m: ChatMessage) => void;
  onOpenPhoto: (url: string) => void;
}) {
  if (m.system) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-center text-xs font-medium text-amber-200">
          {m.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${m.mine ? "flex-row-reverse" : ""}`}>
      {!m.mine && <RoomAvatar name={m.name} image={m.image} className="h-8 w-8 text-[11px]" />}
      <div className={`flex max-w-[80%] flex-col ${m.mine ? "items-end" : "items-start"}`}>
        {!m.mine && <span className="mb-0.5 text-[11px] font-medium text-white/60">{m.name}</span>}
        {m.photoUrl && (
          <button
            type="button"
            onClick={() => !m.status && onOpenPhoto(m.photoUrl!)}
            className="relative mb-1 overflow-hidden rounded-2xl bg-white/5"
            aria-label="Open photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- user photos from our storage; next/image would need every host configured */}
            <img
              src={m.photoUrl}
              alt={m.text || "Shared photo"}
              loading="lazy"
              decoding="async"
              className="block h-44 w-56 max-w-full object-cover"
            />
            {m.status === "sending" && <UploadRing progress={m.progress ?? 0} />}
          </button>
        )}
        {m.text && (
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-snug ${
              m.mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white/10 text-white"
            } ${m.status === "sending" ? "opacity-70" : ""}`}
          >
            <Linkified text={m.text} />
          </div>
        )}
        {m.status === "failed" ? (
          <button type="button" onClick={() => onRetry(m)} className="mt-1 flex items-center gap-1 text-left text-[11px] text-red-400">
            <AlertCircle className="h-3 w-3 shrink-0" /> {m.error || "Not sent — tap to try again"}
          </button>
        ) : (
          <span className="mt-0.5 text-[10px] text-white/40">{timeOf(m.sentAt)}</span>
        )}
      </div>
    </div>
  );
});

/** Full-screen photo viewer (tap anywhere or ✕ to close). */
function PhotoViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4" onClick={onClose}>
      <button
        type="button"
        aria-label="Close photo"
        onClick={onClose}
        className="absolute right-3 top-[max(env(safe-area-inset-top),12px)] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
      >
        <X className="h-6 w-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element -- see MessageRow */}
      <img src={url} alt="Shared photo" className="max-h-full max-w-full rounded-lg object-contain" />
    </div>
  );
}

/**
 * Class chat: a bottom sheet on phones (keeps the video visible above it) and
 * a column beside the video on large screens. Messages, links and photos.
 */
export const ChatPanel = memo(function ChatPanel({
  open,
  messages,
  onSend,
  onSendPhoto,
  onRetry,
  onClose,
  onError,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [viewing, setViewing] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    stickToBottom.current = true;
    onSend(draft);
    setDraft("");
  };

  const pickPhoto = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    stickToBottom.current = true;
    // A typed message goes along as the photo's caption.
    const caption = draft;
    setDraft("");
    const problem = await onSendPhoto(file, caption);
    if (problem) {
      setDraft(caption);
      onError(problem);
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        desktop="side"
        mobileHeight="h-[62dvh]"
        title="Class chat"
        icon={<MessageCircle className="h-4 w-4 text-primary" />}
        footer={
          <form
            onSubmit={submit}
            className="flex shrink-0 items-end gap-2 border-t border-white/10 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
          >
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_PHOTO_TYPES}
              className="hidden"
              onChange={(e) => void pickPhoto(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Share a photo"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHAT_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) submit(e);
              }}
              rows={1}
              enterKeyHint="send"
              placeholder="Message the class…"
              aria-label="Message"
              // 16px on phones stops iOS from zooming into the field.
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-base text-white placeholder:text-white/40 focus:border-primary/60 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 disabled:opacity-40"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </form>
        }
      >
        <div
          ref={listRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
          }}
          className="h-full space-y-3 overflow-y-auto overscroll-contain px-4 py-2"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-white/50">
              <MessageCircle className="h-8 w-8" />
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Say hello, share a link or a photo 👋</p>
            </div>
          ) : (
            messages.map((m) => <MessageRow key={m.id} message={m} onRetry={onRetry} onOpenPhoto={setViewing} />)
          )}
        </div>
      </Sheet>
      {viewing && <PhotoViewer url={viewing} onClose={() => setViewing(null)} />}
    </>
  );
});
