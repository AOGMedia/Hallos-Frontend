"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, MessageCircle, SendHorizontal, X } from "lucide-react";
import { MAX_CHAT_LENGTH, initialsOf } from "../lib/events";
import type { ChatMessage } from "../hooks/useClassChat";

interface ChatPanelProps {
  open: boolean;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onRetry: (message: ChatMessage) => void;
  onClose: () => void;
}

function timeOf(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Class chat. A bottom sheet on phones (thumb-reachable, keeps the video
 * visible above it) and a side panel on large screens.
 */
export function ChatPanel({ open, messages, onSend, onRetry, onClose }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages.length, open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    stickToBottom.current = true;
    onSend(draft);
    setDraft("");
  };

  if (!open) return null;

  return (
    <>
      {/* Tap-outside to close on phones */}
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/30 lg:hidden"
      />
      <section
        aria-label="Class chat"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[62dvh] flex-col rounded-t-3xl border-t border-white/10 bg-[#141a28]/95 shadow-2xl backdrop-blur-xl lg:static lg:z-auto lg:h-full lg:w-[22rem] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 lg:hidden" />
        <header className="flex items-center justify-between px-4 pb-2 pt-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <MessageCircle className="h-4 w-4 text-primary" /> Class chat
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div
          ref={listRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
          }}
          className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-2"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/50">
              <MessageCircle className="h-8 w-8" />
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Say hello to the class 👋</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.mine ? "flex-row-reverse" : ""}`}>
                {!m.mine && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/25 text-[11px] font-semibold text-white">
                    {initialsOf(m.name)}
                  </div>
                )}
                <div className={`flex max-w-[80%] flex-col ${m.mine ? "items-end" : "items-start"}`}>
                  {!m.mine && <span className="mb-0.5 text-[11px] font-medium text-white/60">{m.name}</span>}
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                      m.mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white/10 text-white"
                    } ${m.status === "sending" ? "opacity-70" : ""}`}
                  >
                    {m.text}
                  </div>
                  {m.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => onRetry(m)}
                      className="mt-1 flex items-center gap-1 text-[11px] text-red-400"
                    >
                      <AlertCircle className="h-3 w-3" /> Not sent — tap to retry
                    </button>
                  ) : (
                    <span className="mt-0.5 text-[10px] text-white/40">{timeOf(m.sentAt)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={submit}
          className="flex items-end gap-2 border-t border-white/10 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHAT_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) submit(e);
            }}
            rows={1}
            placeholder="Message the class…"
            aria-label="Message"
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
      </section>
    </>
  );
}
