'use client';

import { useRef, useState } from 'react';
import { formatTime } from '@/lib/video/playerUtils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  onSeek: (time: number) => void;
}

/**
 * YouTube-style seek bar: buffered and played parts, grows on hover, shows
 * the time under the pointer, drags smoothly with a finger, and works with
 * the keyboard (arrows) for accessibility.
 */
export function ProgressBar({ currentTime, duration, bufferedEnd, onSeek }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const timeAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !duration) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
  };
  const pct = (t: number) => (duration ? `${(Math.min(t, duration) / duration) * 100}%` : '0%');
  const shown = dragTime ?? currentTime;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(shown)}
      aria-valuetext={`${formatTime(shown)} of ${formatTime(duration)}`}
      className="group/bar relative flex h-5 w-full cursor-pointer touch-none items-center outline-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragTime(timeAt(e.clientX));
      }}
      onPointerMove={(e) => {
        const time = timeAt(e.clientX);
        if (dragTime !== null) setDragTime(time);
        if (e.pointerType === 'mouse') {
          const rect = trackRef.current!.getBoundingClientRect();
          setHover({ x: e.clientX - rect.left, time });
        }
      }}
      onPointerUp={(e) => {
        if (dragTime !== null) onSeek(timeAt(e.clientX));
        setDragTime(null);
      }}
      onPointerCancel={() => setDragTime(null)}
      onPointerLeave={() => setHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); onSeek(currentTime + 5); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); onSeek(currentTime - 5); }
      }}
    >
      <div className={`relative w-full overflow-hidden rounded-full bg-white/25 transition-[height] duration-150 ${dragTime !== null ? 'h-[5px]' : 'h-[3px] group-hover/bar:h-[5px]'}`}>
        <div className="absolute inset-y-0 left-0 bg-white/40" style={{ width: pct(bufferedEnd) }} />
        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: pct(shown) }} />
      </div>
      <div
        className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow transition-transform ${dragTime !== null ? 'scale-100' : 'scale-0 group-hover/bar:scale-100 group-focus-visible/bar:scale-100'}`}
        style={{ left: pct(shown) }}
      />
      {(hover || dragTime !== null) && (
        <span
          className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-xs font-medium tabular-nums text-white"
          style={{ left: dragTime !== null ? pct(dragTime) : hover!.x }}
        >
          {formatTime(dragTime ?? hover!.time)}
        </span>
      )}
    </div>
  );
}
