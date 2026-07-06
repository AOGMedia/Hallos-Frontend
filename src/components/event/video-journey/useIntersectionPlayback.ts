'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VIDEO_CONFIG } from './constants';

interface UseIntersectionPlaybackReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
  isSufficientlyVisible: boolean;
}

export function useIntersectionPlayback(): UseIntersectionPlaybackReturn {
  const ref = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSufficientlyVisible, setIsSufficientlyVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const ratio = entry.intersectionRatio;
        setIsVisible(ratio > 0);
        setIsSufficientlyVisible(ratio >= VIDEO_CONFIG.intersection.playThreshold);
      },
      {
        threshold: VIDEO_CONFIG.intersection.thresholds,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return { ref, isVisible, isSufficientlyVisible };
}
