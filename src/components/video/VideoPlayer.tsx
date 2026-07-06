'use client';

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import Hls from 'hls.js';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { shareUrl } from '@/lib/video/playerUtils';
import { VideoControls } from './VideoControls';
import { VideoPlayButton } from './VideoPlayButton';
import { VideoShareModal } from './VideoShareModal';
import type { VideoPlayerProps } from '@/types/video';

function VideoPlayerComponent({ videoUrl, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Share 
  async function handleShare() {
    const result = await shareUrl(window.location.href);
    if (result === 'fallback') {
      setShowShareModal(true);
    } else if (result === 'copied') {
      setShareCopied(true);
      setShowShareModal(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  async function handleCopyLink() {
    const result = await shareUrl(window.location.href);
    if (result !== 'fallback') {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  //  Controls visibility 
  const resetHideControlsTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    if (isPlaying) {
      hideControlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    resetHideControlsTimeout();
  }, [resetHideControlsTimeout]);

  //  Playback 
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    const v = value[0] / 100;
    videoRef.current.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isFinite(prog) ? prog : 0);
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoRef.current?.duration) return;
    const time = (value[0] / 100) * videoRef.current.duration;
    if (isFinite(time)) { videoRef.current.currentTime = time; setProgress(value[0]); }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) { setVolume(0); } else { setVolume(1); videoRef.current.volume = 1; }
  }, [isMuted]);

  const setSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) { containerRef.current.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  }, [currentTime, duration]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsVertical(videoRef.current.videoWidth / videoRef.current.videoHeight < 1);
  }, []);

  //  HLS 
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    if (!/\.m3u8(\?|$)/.test(videoUrl)) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(el);
      return () => hls.destroy();
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = videoUrl;
    }
  }, [videoUrl]);

  //  Play/pause events 
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => { setIsPlaying(true); resetHideControlsTimeout(); };
    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, [resetHideControlsTimeout]);

  //  Fullscreen change 
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcuts 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'm': e.preventDefault(); toggleMute(); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
        case 'ArrowLeft': case 'j': e.preventDefault(); skip(-10); break;
        case 'ArrowRight': case 'l': e.preventDefault(); skip(10); break;
        case 'ArrowUp': e.preventDefault(); handleVolumeChange([Math.min(100, volume * 100 + 10)]); break;
        case 'ArrowDown': e.preventDefault(); handleVolumeChange([Math.max(0, volume * 100 - 10)]); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skip, handleVolumeChange, volume]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative w-full mx-auto rounded-xl overflow-hidden bg-black shadow-2xl h-screen',
        isVertical ? 'max-w-md aspect-[9/16]' : 'max-w-5xl aspect-video'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        src={videoUrl}
        poster={thumbnail}
        onClick={togglePlay}
      />

      <VideoPlayButton isPlaying={isPlaying} onPlay={togglePlay} />

      <VideoControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        playbackSpeed={playbackSpeed}
        isFullscreen={isFullscreen}
        showControls={showControls}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
        onSkip={skip}
        onSetSpeed={setSpeed}
        onToggleFullscreen={toggleFullscreen}
        onShare={handleShare}
      />

      <VideoShareModal
        isOpen={showShareModal}
        copied={shareCopied}
        onClose={() => setShowShareModal(false)}
        onCopy={handleCopyLink}
      />
    </motion.div>
  );
}

export const VideoPlayer = memo(VideoPlayerComponent);
VideoPlayer.displayName = 'VideoPlayer';
