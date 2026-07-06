'use client';

import React, { useCallback, useRef } from 'react';
import { Check } from 'lucide-react';
import { VideoChapter } from './types';

export interface ChapterItemProps {
  chapter: VideoChapter;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: (index: number) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ChapterItem = React.memo(function ChapterItem({
  chapter,
  index,
  isActive,
  isCompleted,
  onClick,
}: ChapterItemProps) {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(index);
      }
    },
    [onClick, index]
  );

  const baseClasses = [
    'relative flex flex-row gap-4 p-3 rounded-xl cursor-pointer',
    'bg-[rgba(242,242,242,0.04)]',
    'transition-transform duration-200',
    isActive
      ? 'border-2 border-[#6a57e5] shadow-[0_0_20px_rgba(106,87,229,0.3)]'
      : 'border border-[rgba(234,234,234,0.1)] opacity-70',
  ].join(' ');

  const hoverClasses = prefersReducedMotion.current
    ? ''
    : 'hover:scale-[1.02] hover:opacity-100 hover:border-[rgba(234,234,234,0.25)]';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`Play chapter ${index + 1}: ${chapter.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${baseClasses} ${hoverClasses} focus:outline-none focus:ring-2 focus:ring-[#6a57e5] focus:ring-offset-2 focus:ring-offset-transparent`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={chapter.posterSrc}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Completed checkmark */}
        {isCompleted && (
          <div className="absolute bottom-1 right-1 bg-[#6a57e5] w-5 h-5 rounded-full flex items-center justify-center">
            <Check size={12} color="white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h3 className="text-regular text-[#f2f2f2] leading-snug line-clamp-1">
          {chapter.title}
        </h3>
        <p className="text-description text-[#888c94] leading-snug line-clamp-2 mt-0.5">
          {chapter.description}
        </p>
        <span className="text-small text-[#888c94] mt-1">
          {formatDuration(chapter.duration)}
        </span>
      </div>
    </div>
  );
});

export default ChapterItem;