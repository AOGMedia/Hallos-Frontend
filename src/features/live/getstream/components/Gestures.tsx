"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Touch gestures for the phone room. Both components move their content with
 * CSS transforms set directly on the element — no React state per frame — so
 * they stay smooth on low-end phones.
 */

const MAX_ZOOM = 4;
const DOUBLE_TAP_MS = 280;

/**
 * Pinch to zoom, drag to pan, double-tap to zoom in/out — for reading a
 * shared screen on a phone. A single tap (no movement) is passed through so
 * the room can toggle its controls.
 */
export function ZoomPan({ children, onTap, className = "" }: { children: ReactNode; onTap?: () => void; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startScale: number; startDist: number; startX: number; startY: number; px: number; py: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const apply = (animate = false) => {
    const el = contentRef.current;
    const frame = frameRef.current;
    if (!el || !frame) return;
    const { scale } = view.current;
    // Keep the content covering the frame (no panning into empty space).
    const maxX = ((scale - 1) * frame.clientWidth) / 2;
    const maxY = ((scale - 1) * frame.clientHeight) / 2;
    view.current.x = Math.min(maxX, Math.max(-maxX, view.current.x));
    view.current.y = Math.min(maxY, Math.max(-maxY, view.current.y));
    el.style.transition = animate ? "transform 200ms cubic-bezier(.2,.8,.2,1)" : "none";
    el.style.transform = `translate3d(${view.current.x}px, ${view.current.y}px, 0) scale(${scale})`;
  };

  useEffect(() => () => clearTimeout(tapTimer.current), []);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = {
      startScale: view.current.scale,
      startDist: distance(),
      startX: view.current.x,
      startY: view.current.y,
      px: e.clientX,
      py: e.clientY,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size >= 2) {
      const d = distance();
      if (g.startDist > 0) {
        view.current.scale = Math.min(MAX_ZOOM, Math.max(1, (g.startScale * d) / g.startDist));
        g.moved = true;
        apply();
      }
    } else if (view.current.scale > 1) {
      const dx = e.clientX - g.px;
      const dy = e.clientY - g.py;
      if (Math.abs(dx) + Math.abs(dy) > 4) g.moved = true;
      view.current.x = g.startX + dx;
      view.current.y = g.startY + dy;
      apply();
    } else if (Math.abs(e.clientX - g.px) + Math.abs(e.clientY - g.py) > 8) {
      g.moved = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      // One finger lifted from a pinch: continue as a pan from here.
      const [rest] = [...pointers.current.values()];
      gesture.current = { startScale: view.current.scale, startDist: 0, startX: view.current.x, startY: view.current.y, px: rest.x, py: rest.y, moved: true };
      return;
    }
    gesture.current = null;
    if (!g || g.moved) return;

    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      clearTimeout(tapTimer.current);
      lastTap.current = 0;
      // Double-tap: zoom in where tapped, or back out.
      if (view.current.scale > 1) {
        view.current = { scale: 1, x: 0, y: 0 };
      } else {
        const frame = frameRef.current!.getBoundingClientRect();
        const scale = 2.5;
        view.current = {
          scale,
          x: (frame.width / 2 - (e.clientX - frame.left)) * (scale - 1),
          y: (frame.height / 2 - (e.clientY - frame.top)) * (scale - 1),
        };
      }
      apply(true);
    } else {
      lastTap.current = now;
      tapTimer.current = setTimeout(() => onTap?.(), DOUBLE_TAP_MS);
    }
  };

  return (
    <div
      ref={frameRef}
      className={`relative h-full w-full touch-none overflow-hidden ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={contentRef} className="h-full w-full origin-center will-change-transform">
        {children}
      </div>
    </div>
  );
}

/**
 * A small floating window you can drag anywhere; it snaps to the nearest
 * corner when let go (like the Meet app's self-view).
 */
export function DraggablePip({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  const set = (x: number, y: number, animate: boolean) => {
    const el = ref.current;
    if (!el) return;
    offset.current = { x, y };
    el.style.transition = animate ? "transform 220ms cubic-bezier(.2,.8,.2,1)" : "none";
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: offset.current.x, oy: offset.current.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    set(d.ox + e.clientX - d.sx, d.oy + e.clientY - d.sy, false);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    const el = ref.current;
    const parent = el?.offsetParent as HTMLElement | null;
    drag.current = null;
    if (!el || !parent) return;
    // Snap to the nearest corner (it starts bottom-right; offsets are relative to that).
    const w = parent.clientWidth - el.offsetWidth - 24;
    const h = parent.clientHeight - el.offsetHeight - 24;
    const left = offset.current.x < -w / 2;
    const top = offset.current.y < -h / 2;
    set(left ? -w : 0, top ? -h : 0, true);
  };

  return (
    <div
      ref={ref}
      className={`absolute bottom-3 right-3 z-20 touch-none overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
