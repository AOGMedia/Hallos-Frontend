'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardCallbacks {
  togglePlay?: () => void;
  skip?: (seconds: number) => void;
  setVolume?: (volume: number) => void;
  toggleMute?: () => void;
  toggleFullscreen?: () => void;
  prevChapter?: () => void;
  nextChapter?: () => void;
}

interface UseKeyboardNavigationProps {
  callbacks: KeyboardCallbacks;
  volume?: number;
  isEnabled: boolean;
}

export function useKeyboardNavigation({ callbacks, volume = 1, isEnabled }: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      const { togglePlay, skip, setVolume, toggleMute, toggleFullscreen, prevChapter, nextChapter } = callbacks;

      switch (event.key) {
        case ' ':
        case 'Space':
        case 'k':
          togglePlay?.();
          event.preventDefault();
          break;
        case 'ArrowLeft':
          skip?.(-10);
          event.preventDefault();
          break;
        case 'ArrowRight':
          skip?.(10);
          event.preventDefault();
          break;
        case 'ArrowUp':
          setVolume?.(Math.min(1, volume + 0.1));
          event.preventDefault();
          break;
        case 'ArrowDown':
          setVolume?.(Math.max(0, volume - 0.1));
          event.preventDefault();
          break;
        case 'm':
          toggleMute?.();
          event.preventDefault();
          break;
        case 'f':
          toggleFullscreen?.();
          event.preventDefault();
          break;
        case 'j':
          prevChapter?.();
          event.preventDefault();
          break;
        case 'l':
          nextChapter?.();
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    [callbacks, isEnabled, volume]
  );

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);
}
