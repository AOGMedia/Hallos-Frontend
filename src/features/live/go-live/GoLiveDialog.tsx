"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * "Ready to go live?" — shown before a creator opens the room for a class or
 * session that isn't live yet, because opening the room starts it for
 * everyone. Bottom sheet on phones, centred dialog on larger screens.
 * "Not now" has the initial focus, so a stray Enter can't start a class.
 */
export function GoLiveDialog({
  open,
  title,
  kind,
  starting,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  kind: "class" | "session";
  starting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !starting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, starting, onCancel]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="go-live-title"
          aria-describedby="go-live-text"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !starting && onCancel()}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#121725] px-6 pt-7 pb-[max(env(safe-area-inset-bottom),24px)] text-center shadow-[0_-24px_60px_-12px_rgba(0,0,0,0.7)] sm:rounded-3xl sm:pb-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)" }}
            />
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
              </span>
            </div>
            <h2 id="go-live-title" className="relative text-xl font-bold text-white">
              Ready to go live?
            </h2>
            <p id="go-live-text" className="relative mt-2 text-sm leading-relaxed text-white/65">
              <span className="font-semibold text-white">&ldquo;{title}&rdquo;</span> will start now and your attendees
              will be able to join this {kind}.
            </p>

            <div className="relative mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                disabled={starting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-6 py-3.5 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(239,68,68,0.7)] transition active:scale-[0.98] disabled:opacity-70"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-2 w-2 rounded-full bg-white" />}
                {starting ? "Going live…" : "Go live"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={starting}
                autoFocus
                className="w-full rounded-full border border-white/15 px-6 py-3.5 font-semibold text-white/80 transition hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
