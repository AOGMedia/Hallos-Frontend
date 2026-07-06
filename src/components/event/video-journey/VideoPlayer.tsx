'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { PlaybackState, VideoChapter } from './types';

interface VideoPlayerProps {
  chapter: VideoChapter;
  state: PlaybackState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
}

const VideoPlayer = React.memo(function VideoPlayer({
  chapter,
  state,
  videoRef,
  isActive,
}: VideoPlayerProps) {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = state.isMuted;
    video.volume = state.volume;
  }, [state.isMuted, state.volume, videoRef]);

  const showPlayOverlay = !state.isPlaying && !state.isEnded;

  const motionProps = prefersReducedMotion.current
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <div className="event-info-bar relative overflow-hidden rounded-2xl w-full h-full min-h-[300px]">
      {/* Chapter transition wrapper */}
      <motion.div
        key={chapter.id}
        className="absolute inset-0"
        {...motionProps}
        transition={
          prefersReducedMotion.current
            ? { duration: 0 }
            : { duration: 0.3 }
        }
      >
        {/* Video element */}
        <video
          ref={videoRef}
          playsInline
          muted={state.isMuted}
          preload={isActive ? 'auto' : 'metadata'}
          poster={chapter.posterSrc}
          src={chapter.videoSrc}
          aria-label={`Now playing: ${chapter.title}`}
          className="w-full h-full object-contain"
        />

        {/* Buffering spinner */}
        <AnimatePresence>
          {state.isBuffering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              <div className="w-10 h-10 border-2 border-[#6a57e5] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play overlay */}
        <AnimatePresence>
          {showPlayOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <button
                type="button"
                aria-label="Play video"
                onClick={() => {
                  const video = videoRef.current;
                  if (video) video.play().catch(() => {});
                }}
                className="glass-effect rounded-full w-20 h-20 flex items-center justify-center text-[#f2f2f2] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#6a57e5] transition-opacity"
              >
                <Play size={32} className="ml-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default VideoPlayer;