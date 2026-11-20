"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

/**
 * The frame every feedback screen sits in: a quiet top bar (back, the Hallos
 * mark, close), an optional segmented progress bar, the content, and an
 * optional footer pinned to the bottom (thumb reach, above the home bar).
 */
export function FeedbackShell({
  children,
  footer,
  progress,
  onBack,
}: {
  children: ReactNode;
  footer?: ReactNode;
  progress?: { current: number; total: number };
  onBack?: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0d0f18] text-white">
      <header className="sticky top-0 z-10 bg-[#0d0f18]/95 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4">
          <div className="w-11">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Previous question"
                className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-white/80 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          <Image src="/transparentlogo.svg" alt="Hallos" width={84} height={21} priority />
          <Link
            href="/"
            aria-label="Close"
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-white/60 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        {progress && (
          <div
            className="mx-auto mt-3 flex max-w-lg gap-1.5 px-5 pb-3"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.current}
            aria-label={`Question ${progress.current} of ${progress.total}`}
          >
            {Array.from({ length: progress.total }, (_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < progress.current ? "bg-primary" : "bg-white/12"}`}
              />
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-6 pt-6 sm:pt-10">{children}</main>

      {footer && (
        <footer className="sticky bottom-0 border-t border-white/[0.06] bg-[#0d0f18]/95 backdrop-blur">
          <div className="mx-auto max-w-lg px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">{footer}</div>
        </footer>
      )}
    </div>
  );
}

/** The main action button used across the screens. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  busy,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className="flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[15px] font-semibold text-white outline-none transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.99] disabled:opacity-40 motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}
