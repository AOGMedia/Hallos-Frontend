"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * "Ready to go live?" — shown before a creator opens the room for a class or
 * session that isn't live yet, because opening the room starts it for
 * everyone. Bottom sheet on phones, centred dialog on larger screens.
 * "Not now" has the initial focus, so a stray Enter can't start a class.
 *
 * Kept flicker-free on purpose: only transform/opacity animate, nothing that
 * animates has a blur filter (backdrop or glow), and the page behind doesn't
 * scroll while it's open.
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
  const notNowRef = useRef<HTMLButtonElement>(null);
  // Latest handlers without re-subscribing listeners on every parent render.
  const latest = useRef({ starting, onCancel });
  latest.current = { starting, onCancel };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !latest.current.starting) latest.current.onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    // The page behind stays still while the prompt is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus "Not now" without letting the browser scroll anything into view.
    const focusTimer = window.setTimeout(() => notNowRef.current?.focus({ preventScroll: true }), 50);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          key="go-live"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="go-live-title"
          aria-describedby="go-live-text"
        >
          {/* Plain dim (no backdrop blur): fading a blurred layer flickers on many phones. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={() => !starting && onCancel()}
            className="absolute inset-0 bg-black/75"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#121725] px-6 pt-7 pb-[max(env(safe-area-inset-bottom),24px)] text-center shadow-[0_-24px_60px_-12px_rgba(0,0,0,0.7)] sm:rounded-3xl sm:pb-6"
          >
            {/* Soft red glow: a gradient alone (no blur filter to repaint while it moves). */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-35"
              style={{ background: "radial-gradient(circle, rgba(239,68,68,0.9), rgba(239,68,68,0) 65%)" }}
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
                className="flex w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-6 py-3.5 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(239,68,68,0.7)] transition active:scale-[0.98] disabled:opacity-70"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-2 w-2 rounded-full bg-white" />}
                {starting ? "Going live…" : "Go live"}
              </button>
              <button
                ref={notNowRef}
                type="button"
                onClick={onCancel}
                disabled={starting}
                className="w-full touch-manipulation rounded-full border border-white/15 px-6 py-3.5 font-semibold text-white/80 transition hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
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
