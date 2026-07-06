'use client';

import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import Hls from 'hls.js';
import { PlaybackActionType, PlaybackState, VideoAnalyticsEvent, VideoChapter } from './types';
import { VIDEO_CONFIG } from './constants';

const initialState: PlaybackState = {
  isPlaying: false,
  isMuted: true,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isFullscreen: false,
  isBuffering: false,
  isEnded: false,
};

function playbackReducer(state: PlaybackState, action: PlaybackActionType): PlaybackState {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true, isEnded: false };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying, isEnded: false };
    case 'MUTE':
      return { ...state, isMuted: true };
    case 'UNMUTE':
      return { ...state, isMuted: false };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_VOLUME':
      return { ...state, volume: Math.min(1, Math.max(0, action.payload)), isMuted: action.payload === 0 };
    case 'SEEK':
      return { ...state, currentTime: Math.max(0, Math.min(state.duration, action.payload)) };
    case 'SKIP':
      return { ...state, currentTime: Math.max(0, Math.min(state.duration, state.currentTime + action.payload)) };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'SET_ENDED':
      return { ...state, isEnded: action.payload, isPlaying: !action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'GO_TO_CHAPTER':
      return { ...initialState };
    default:
      return state;
  }
}

interface UseVideoPlaybackProps {
  chapter: VideoChapter;
  chapters: VideoChapter[];
  isSufficientlyVisible: boolean;
  onAnalytics?: (event: VideoAnalyticsEvent) => void;
  onAutoAdvance?: (nextIndex: number) => void;
}

interface UseVideoPlaybackReturn {
  state: PlaybackState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  seek: (t: number) => void;
  skip: (seconds: number) => void;
  goToChapter: (index: number) => void;
  toggleFullscreen: () => void;
  setOnEndedCallback: (cb: ((nextIndex: number) => void) | null) => void;
}

export function useVideoPlayback({
  chapter,
  chapters,
  isSufficientlyVisible,
  onAnalytics,
  onAutoAdvance,
}: UseVideoPlaybackProps): UseVideoPlaybackReturn {
  const [state, dispatch] = useReducer(playbackReducer, initialState);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastTimeUpdateRef = useRef(0);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAutoAdvanceRef = useRef<((nextIndex: number) => void) | null>(onAutoAdvance ?? null);
  const chapterIndexRef = useRef(chapters.findIndex((c) => c.id === chapter.id));

  useEffect(() => {
    onAutoAdvanceRef.current = onAutoAdvance ?? null;
  }, [onAutoAdvance]);

  // Set current chapter index from chapters array
  useEffect(() => {
    chapterIndexRef.current = chapters.findIndex((c) => c.id === chapter.id);
  }, [chapter, chapters]);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Clean previous video source
    video.src = '';
    video.load();

    dispatch({ type: 'GO_TO_CHAPTER', payload: chapters.findIndex((c) => c.id === chapter.id) });

    if (chapter.hlsSrc && Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(chapter.hlsSrc!);
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && chapter.hlsSrc) {
      // Native HLS support (Safari)
      video.src = chapter.hlsSrc;
    } else if (chapter.videoSrc) {
      video.src = chapter.videoSrc;
    }

    video.load();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.src = '';
        video.load();
      }
    };
  }, [chapter, chapters]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: video.duration || 0 });
    };

    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastTimeUpdateRef.current >= VIDEO_CONFIG.playback.timeupdateThrottle) {
        lastTimeUpdateRef.current = now;
        dispatch({ type: 'SET_CURRENT_TIME', payload: video.currentTime });
      }
    };

    const onWaiting = () => dispatch({ type: 'SET_BUFFERING', payload: true });
    const onPlaying = () => dispatch({ type: 'SET_BUFFERING', payload: false });

    const onEnded = () => {
      dispatch({ type: 'SET_ENDED', payload: true });
      const currentIdx = chapterIndexRef.current;
      if (currentIdx >= 0 && currentIdx < chapters.length - 1) {
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          if (onAutoAdvanceRef.current) {
            onAutoAdvanceRef.current(currentIdx + 1);
          }
        }, VIDEO_CONFIG.playback.autoAdvanceDelay);
      }
    };

    const onError = () => {
      dispatch({ type: 'PAUSE' });
      console.error('Video error');
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, [chapter, chapters]);

  // Fullscreen listener
  useEffect(() => {
    const onFullscreenChange = () => {
      dispatch({ type: 'SET_FULLSCREEN', payload: Boolean(document.fullscreenElement) });
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // Autoplay when sufficiently visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video || state.isEnded) return;

    if (isSufficientlyVisible) {
      const doPlay = async () => {
        try {
          video.muted = false;
          await video.play();
          dispatch({ type: 'PLAY' });
          onAnalytics?.({
            type: 'video_started',
            chapterId: chapter.id,
            chapterIndex: chapterIndexRef.current,
            timestamp: Date.now(),
          });
        } catch (err) {
          if (err instanceof DOMException && err.name === 'NotAllowedError') {
            try {
              video.muted = true;
              await video.play();
              dispatch({ type: 'MUTE' });
              dispatch({ type: 'PLAY' });
            } catch {
              // autoplay truly disallowed
            }
          }
        }
      };
      doPlay();
    } else {
      video.pause();
      dispatch({ type: 'PAUSE' });
    }
  }, [isSufficientlyVisible, state.isEnded, onAnalytics, chapter.id]);

  // Sync video element with state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = state.isMuted;
    video.volume = state.volume;
  }, [state.isMuted, state.volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - state.currentTime) > 0.5) {
      video.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => dispatch({ type: 'PLAY' })).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    dispatch({ type: 'PAUSE' });
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (state.isPlaying) {
      video.pause();
      dispatch({ type: 'PAUSE' });
    } else {
      video.play().then(() => dispatch({ type: 'PLAY' })).catch(() => {});
    }
  }, [state.isPlaying]);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const setVolume = useCallback((v: number) => {
    dispatch({ type: 'SET_VOLUME', payload: v });
  }, []);

  const seek = useCallback((t: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = t;
    dispatch({ type: 'SEEK', payload: t });
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + seconds));
    video.currentTime = newTime;
    dispatch({ type: 'SET_CURRENT_TIME', payload: newTime });
  }, []);

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;
      onAutoAdvanceRef.current?.(index);
    },
    [chapters.length]
  );

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const setOnEndedCallback = useCallback((cb: ((nextIndex: number) => void) | null) => {
    onAutoAdvanceRef.current = cb;
  }, []);

  return {
    state,
    videoRef,
    play,
    pause,
    togglePlay,
    toggleMute,
    setVolume,
    seek,
    skip,
    goToChapter,
    toggleFullscreen,
    setOnEndedCallback,
  };
}
