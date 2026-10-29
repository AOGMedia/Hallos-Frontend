"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  icon?: ReactNode;
  /** Right side of the header (e.g. a "Lower all" button). */
  headerAction?: ReactNode;
  /**
   * Large screens: 'side' docks it as a column beside the video (chat),
   * 'dialog' shows a centred panel (gifts, raised hands, more).
   */
  desktop?: "side" | "dialog";
  /** Phone height, e.g. "h-[62dvh]" or "max-h-[80dvh]". */
  mobileHeight?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const CLOSE_DRAG_PX = 90;
const isPhoneLayout = () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

/**
 * Bottom sheet on phones — slides up, sits above the keyboard (--kb-inset
 * from useMobileRoom) and closes with a downward swipe on its handle/header,
 * like a native app. The drag moves the panel directly (no React re-render per
 * frame) so it stays smooth on low-end phones. Escape also closes it.
 */
export function Sheet({
  open,
  onClose,
  title,
  icon,
  headerAction,
  desktop = "dialog",
  mobileHeight = "max-h-[80dvh]",
  children,
  footer,
}: SheetProps) {
  const panelRef = useRef<HTMLElement>(null);
  const drag = useRef<{ startY: number; dy: number; pointerId: number } | null>(null);

  // Slide-up entrance on phones (transform only: cheap for the GPU).
  useEffect(() => {
    if (!open || !isPhoneLayout()) return;
    const el = panelRef.current;
    if (!el || typeof el.animate !== "function") return;
    const animation = el.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], {
      duration: 240,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
    return () => animation.cancel();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isPhoneLayout() || (e.target as HTMLElement).closest("button")) return;
    drag.current = { startY: e.clientY, dy: 0, pointerId: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const state = drag.current;
    const el = panelRef.current;
    if (!state || !el || state.pointerId !== e.pointerId) return;
    state.dy = Math.max(0, e.clientY - state.startY);
    el.style.transition = "none";
    el.style.transform = `translateY(${state.dy}px)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const state = drag.current;
    const el = panelRef.current;
    drag.current = null;
    if (!state || !el || state.pointerId !== e.pointerId) return;
    el.style.transition = "transform 200ms cubic-bezier(.2,.8,.2,1)";
    if (state.dy > CLOSE_DRAG_PX) {
      el.style.transform = "translateY(100%)";
      setTimeout(onClose, 180);
    } else {
      el.style.transform = "translateY(0)";
    }
  };

  const desktopPanel =
    desktop === "side"
      ? "lg:static lg:inset-auto lg:z-auto lg:h-full lg:max-h-none lg:w-[22rem] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 lg:pb-0"
      : "lg:inset-auto lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:w-[26rem] lg:max-h-[70vh] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-3xl lg:border";

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 ${desktop === "side" ? "lg:hidden" : ""}`}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal={desktop === "dialog"}
        className={`fixed inset-x-0 bottom-[var(--kb-inset,0px)] z-50 flex flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-[#141a28] text-white shadow-2xl ${mobileHeight} ${desktopPanel}`}
      >
        <div
          className="shrink-0 touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/25 lg:hidden" />
          <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
            <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              {icon}
              <span className="truncate">{title}</span>
            </h2>
            <div className="flex shrink-0 items-center gap-1">
              {headerAction}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer}
      </section>
    </>
  );
}
