'use client';

import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import SoundControl from './SoundControl';
import { PlaybackState } from './types';

export interface VideoControlsProps {
  state: PlaybackState;
  chapterIndex: number;
  totalChapters: number;
  onTogglePlay: () => void;
  onSkip: (seconds: number) => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onToggleFullscreen: () => void;
}

const VideoControls = React.memo(function VideoControls({
  state,
  chapterIndex,
  totalChapters,
  onTogglePlay,
  onSkip,
  onSeek,
  onToggleMute,
  onVolumeChange,
  onPrevChapter,
  onNextChapter,
  onToggleFullscreen,
}: VideoControlsProps) {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const transitionClass = prefersReducedMotion.current
    ? ''
    : 'transition-opacity duration-300';

  return (
    <div
      data-testid="video-controls"
      className={`absolute bottom-0 left-0 right-0 z-20 ${transitionClass} opacity-0 hover:opacity-100`}
    >
      {/* Controls background */}
      <div className="glass-effect rounded-2xl mx-2 sm:mx-4 mb-2 sm:mb-4 px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3">
        {/* Progress bar */}
        <ProgressBar
          currentTime={state.currentTime}
          duration={state.duration}
          onSeek={onSeek}
        />

        {/* Buttons row */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Left cluster */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
              className="text-[#f2f2f2] hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1.5 sm:p-2 transition-opacity"
            >
              {state.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* Skip Back 10 */}
            <button
              type="button"
              onClick={() => onSkip(-10)}
              aria-label="Skip back 10 seconds"
              className="text-[#f2f2f2] hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1.5 sm:p-2 transition-opacity relative"
            >
              <RotateCcw size={16} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold leading-none">
                10
              </span>
            </button>

            {/* Skip Forward 10 */}
            <button
              type="button"
              onClick={() => onSkip(10)}
              aria-label="Skip forward 10 seconds"
              className="text-[#f2f2f2] hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1.5 sm:p-2 transition-opacity relative"
            >
              <RotateCw size={16} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold leading-none">
                10
              </span>
            </button>
          </div>

          {/* Center — chapter counter */}
          <div className="flex-1" />

          {/* Right cluster */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Prev chapter */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onPrevChapter(); }}
              aria-label="Previous chapter"
              disabled={chapterIndex <= 0}
              className="text-[#f2f2f2] hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1.5 sm:p-2 transition-opacity"
            >
              {totalChapters > 1 ? <SkipBack size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Chapter counter */}
            <span className="text-[#888c94] text-xs sm:text-small min-w-[35px] sm:min-w-[40px] text-center select-none">
              {chapterIndex + 1} / {totalChapters}
            </span>

            {/* Next chapter */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onNextChapter(); }}
              aria-label="Next chapter"
              disabled={chapterIndex >= totalChapters - 1}
              className="text-[#f2f2f2] hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1.5 sm:p-2 transition-opacity"
            >
              {totalChapters > 1 ? <SkipForward size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Sound control */}
            <SoundControl
              volume={state.volume}
              isMuted={state.isMuted}
              onVolumeChange={onVolumeChange}
              onMuteToggle={onToggleMute}
            />

            {/* Fullscreen */}
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="text-[#f2f2f2] hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1.5 sm:p-2 transition-opacity"
            >
              {state.isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoControls;