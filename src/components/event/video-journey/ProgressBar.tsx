'use client';

import React, { useCallback, useRef, useState } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.min(Math.floor(seconds), 3599));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const ProgressBar = React.memo(function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipTime, setTooltipTime] = useState<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const getTimeFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track || duration === 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      const time = getTimeFromEvent(e.clientX);
      onSeek(time);
    },
    [getTimeFromEvent, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const time = getTimeFromEvent(e.clientX);
      onSeek(time);
    },
    [getTimeFromEvent, onSeek]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const time = getTimeFromEvent(touch.clientX);
      onSeek(time);
    },
    [getTimeFromEvent, onSeek]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTouchMove = useCallback((e: any) => {
      const touch = e.touches[0];
      if (!touch) return;
      const time = getTimeFromEvent(touch.clientX);
      onSeek(time);
    },
    [getTimeFromEvent, onSeek]
  );

  const handleMouseMoveTracker = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) {
        const time = getTimeFromEvent(e.clientX);
        setTooltipTime(time);
        setTooltipVisible(true);
      }
    },
    [getTimeFromEvent]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDraggingRef.current) {
      setTooltipVisible(false);
      setTooltipTime(null);
    }
  }, []);

  // Attach window-level drag listeners
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative flex items-center w-full h-4 cursor-pointer">
      {/* Slider area */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-label="Seek video"
        className="relative w-full h-1 rounded-full bg-[rgba(242,242,242,0.15)] group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMoveTracker}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + 5));
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 5));
        }}
      >
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#6a57e5] to-[#5099f8]"
          style={{ width: `${progress}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Tooltip */}
      {tooltipVisible && tooltipTime !== null && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-small px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          {formatTime(tooltipTime)}
        </div>
      )}
    </div>
  );
});

export default ProgressBar;