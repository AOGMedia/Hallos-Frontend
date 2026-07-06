'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import ChapterItem from './ChapterItem';
import { VideoChapter } from './types';

export interface ChapterTimelineProps {
  chapters: VideoChapter[];
  activeIndex: number;
  completedIndices: number[];
  onChapterSelect: (index: number) => void;
}

const ChapterTimeline = React.memo(function ChapterTimeline({
  chapters,
  activeIndex,
  completedIndices,
  onChapterSelect,
}: ChapterTimelineProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Auto-scroll active item into view on mobile
  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    const listEl = listRef.current;
    if (!activeEl || !listEl) return;

    // Calculate scroll position to center the active item
    const listRect = listEl.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    const scrollLeft = itemRect.left - listRect.left + listEl.scrollLeft - (listRect.width / 2) + (itemRect.width / 2);

    if (prefersReducedMotion.current) {
      listEl.scrollLeft = scrollLeft;
    } else {
      listEl.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  return (
    <div className="glass-effect rounded-2xl p-6 flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-baseline gap-2">
        <h3 className="heading-small text-[#f2f2f2]">Chapters</h3>
        <span className="text-small text-[#888c94]">
          {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
        </span>
      </div>

      {/* Chapter list */}
      <div
        ref={listRef}
        role="list"
        aria-label="Video chapters"
        className="flex overflow-x-auto lg:flex-col lg:overflow-visible gap-4 scrollbar-hide"
      >
        {chapters.map((chapter, i) => (
          <div key={chapter.id} ref={setItemRef(i)} role="listitem">
            <ChapterItem
              chapter={chapter}
              index={i}
              isActive={i === activeIndex}
              isCompleted={completedIndices.includes(i)}
              onClick={onChapterSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default ChapterTimeline;