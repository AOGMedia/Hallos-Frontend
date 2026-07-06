'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useIntersectionPlayback } from './useIntersectionPlayback';
import { useVideoPlayback } from './useVideoPlayback';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import VideoPlayer from './VideoPlayer';
import VideoControls from './VideoControls';
import ChapterTimeline from './ChapterTimeline';
import { VideoJourneyProps } from './types';

type EventVideoJourneyProps = VideoJourneyProps;

function EventVideoJourneyInner({
  chapters,
  sectionTitle = 'Event Journey',
  sectionSubtitle = 'Relive every moment, from keynote to closing.',
  onAnalytics,
}: EventVideoJourneyProps) {
  // Intersection observer for auto-play
  const { ref: containerRef, isVisible, isSufficientlyVisible } = useIntersectionPlayback();

  // Current chapter index
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Track completed chapters
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  // Track if analytics video_started was fired
  const hasStartedRef = useRef(false);
  const wasMutedRef = useRef(true);

  // The active chapter
  const currentChapter = chapters[currentChapterIndex];

  // Video playback hook
  const {
    state,
    videoRef,
    togglePlay,
    toggleMute,
    setVolume,
    seek,
    skip,
    goToChapter,
    toggleFullscreen,
    setOnEndedCallback,
  } = useVideoPlayback({
    chapter: currentChapter,
    chapters,
    isSufficientlyVisible,
    onAnalytics,
  });

  // Set up the auto-advance callback
  useEffect(() => {
    setOnEndedCallback((nextIndex: number) => {
      setCompletedIndices((prev) =>
        prev.includes(currentChapterIndex)
          ? prev
          : [...prev, currentChapterIndex]
      );
      setCurrentChapterIndex(nextIndex);
    });
  }, [currentChapterIndex, setOnEndedCallback]);

  // Mark previous chapter as completed when user manually navigates
  const handleChapterSelect = useCallback(
    (index: number) => {
      if (index === currentChapterIndex) return;

      // Mark current as completed if leaving it
      setCompletedIndices((prev) =>
        prev.includes(currentChapterIndex)
          ? prev
          : [...prev, currentChapterIndex]
      );

      goToChapter(index);
      setCurrentChapterIndex(index);

      onAnalytics?.({
        type: 'chapter_changed',
        chapterId: chapters[index].id,
        chapterIndex: index,
        timestamp: Date.now(),
      });
    },
    [currentChapterIndex, goToChapter, onAnalytics, chapters]
  );

  // Keyboard navigation
  const handlePrevChapter = useCallback(() => {
    const prev = Math.max(0, currentChapterIndex - 1);
    handleChapterSelect(prev);
  }, [currentChapterIndex, handleChapterSelect]);

  const handleNextChapter = useCallback(() => {
    const next = Math.min(chapters.length - 1, currentChapterIndex + 1);
    handleChapterSelect(next);
  }, [currentChapterIndex, handleChapterSelect, chapters.length]);

  useKeyboardNavigation({
    callbacks: {
      togglePlay,
      skip,
      setVolume,
      toggleMute,
      toggleFullscreen,
      prevChapter: handlePrevChapter,
      nextChapter: handleNextChapter,
    },
    volume: state.volume,
    isEnabled: isVisible,
  });

  // Mobile swipe handling
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null) return;
      const delta = e.changedTouches[0]?.clientX - touchStartXRef.current;
      if (Math.abs(delta) > 50) {
        if (delta > 0) {
          handlePrevChapter();
        } else {
          handleNextChapter();
        }
      }
      touchStartXRef.current = null;
    },
    [handlePrevChapter, handleNextChapter]
  );

  // Analytics: video started (fire once on first play)
  useEffect(() => {
    if (state.isPlaying && !hasStartedRef.current) {
      hasStartedRef.current = true;
      onAnalytics?.({
        type: 'video_started',
        chapterId: currentChapter.id,
        chapterIndex: currentChapterIndex,
        timestamp: Date.now(),
      });
    }
  }, [state.isPlaying, onAnalytics, currentChapter, currentChapterIndex]);

  // Analytics: video completed (when ended and on last chapter)
  useEffect(() => {
    if (state.isEnded && currentChapterIndex === chapters.length - 1) {
      onAnalytics?.({
        type: 'video_completed',
        chapterId: currentChapter.id,
        chapterIndex: currentChapterIndex,
        timestamp: Date.now(),
      });
    }
  }, [state.isEnded, currentChapterIndex, chapters.length, onAnalytics, currentChapter]);

  // Analytics: sound enabled (unmuted after being muted)
  useEffect(() => {
    if (!state.isMuted && wasMutedRef.current) {
      wasMutedRef.current = false;
      onAnalytics?.({
        type: 'sound_enabled',
        chapterId: currentChapter.id,
        chapterIndex: currentChapterIndex,
        timestamp: Date.now(),
      });
    } else if (state.isMuted) {
      wasMutedRef.current = true;
    }
  }, [state.isMuted, onAnalytics, currentChapter, currentChapterIndex]);

  // Analytics: fullscreen entered
  const handleToggleFullscreen = useCallback(() => {
    toggleFullscreen();
    if (!state.isFullscreen) {
      onAnalytics?.({
        type: 'fullscreen_entered',
        chapterId: currentChapter.id,
        chapterIndex: currentChapterIndex,
        timestamp: Date.now(),
      });
    }
  }, [toggleFullscreen, state.isFullscreen, onAnalytics, currentChapter, currentChapterIndex]);

  // Loading skeleton
  if (chapters.length === 0) {
    return (
      <section
        aria-label="Event video journey"
        id="event-journey"
        className="event-hero-colorful-bg relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden"
      >
        {/* Mesh texture overlay */}
        <Image
          src="/images/event/bg-mesh-slots.svg"
          alt=""
          aria-hidden="true"
          width={800}
          height={800}
          className="absolute right-0 top-0 w-auto h-full opacity-30 pointer-events-none select-none rotate-180"
        />
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center">
            <h2
              className="heading-section"
              style={{ color: '#f2f2f2' }}
            >
              {sectionTitle}
            </h2>
            <p className="text-body text-center mt-4" style={{ color: 'rgba(242,242,242,0.8)' }}>
              {sectionSubtitle}
            </p>
          </div>
          <div className="mt-[60px]">
            <div className="video-card animate-shimmer rounded-2xl aspect-video w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Event video journey"
      id="event-journey"
      className="event-hero-colorful-bg relative w-full py-16 sm:py-24 px-0 sm:px-8 lg:px-16 overflow-hidden"
    >
      {/* Mesh texture overlay */}
      <Image
        src="/images/event/bg-mesh-slots.svg"
        alt=""
        aria-hidden="true"
        width={800}
        height={800}
        className="absolute left-0 bottom-0 w-auto h-1/2 opacity-20 pointer-events-none select-none"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-0">
        {/* Heading */}
        <div className="text-center px-4 sm:px-0">
          <h2
            className="heading-section"
         style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.25,
              background:
                'linear-gradient(89.24deg, rgba(0,0,0,1) 15.36%, rgba(106,87,229,1) 83.03%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'}}  
          >
            {sectionTitle}
          </h2>
          <p
            className="text-body text-center mt-4 text-primary"
            // style={{ color: 'rgba(242,242,242,0.8)' }}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_320px] gap-0 lg:gap-8 mt-[60px]">
          {/* Left column: video player */}
          <div className="relative w-full h-full">
            {/* Video area with intersection observer ref */}
            <div
              ref={containerRef as React.RefObject<HTMLDivElement>}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="event-info-bar relative overflow-hidden rounded-2xl w-full h-full min-h-[50vh]"
            >
              <VideoPlayer
                chapter={currentChapter}
                state={state}
                videoRef={videoRef}
                isActive={isSufficientlyVisible}
              />

              {/* Controls overlay */}
              <VideoControls
                state={state}
                chapterIndex={currentChapterIndex}
                totalChapters={chapters.length}
                onTogglePlay={togglePlay}
                onSkip={skip}
                onSeek={seek}
                onToggleMute={toggleMute}
                onVolumeChange={setVolume}
                onPrevChapter={handlePrevChapter}
                onNextChapter={handleNextChapter}
                onToggleFullscreen={handleToggleFullscreen}
              />
            </div>
          </div>

          {/* Right column: chapter timeline */}
          <div className="flex flex-col">
            <ChapterTimeline
              chapters={chapters}
              activeIndex={currentChapterIndex}
              completedIndices={completedIndices}
              onChapterSelect={handleChapterSelect}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Named export as specified in spec
export function EventVideoJourney(props: EventVideoJourneyProps) {
  return <EventVideoJourneyInner {...props} />;
}

export default EventVideoJourney;