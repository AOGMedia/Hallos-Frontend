"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

/**
 * Phones, like the Meet app: tap the video to hide or show the header and
 * controls. While someone presents, they also fade away after a few seconds
 * so the shared screen gets the whole display. Desktop always shows them.
 */
export function useImmersiveChrome({ autoHide, blocked }: { autoHide: boolean; blocked: boolean }) {
  const [hidden, setHidden] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    if (!autoHide || blocked || !isPhone()) return;
    timer.current = setTimeout(() => setHidden(true), 4500);
  }, [autoHide, blocked]);

  // Something needs the controls (a sheet is open, a dialog…): keep them visible.
  useEffect(() => {
    if (blocked) {
      clearTimeout(timer.current);
      setHidden(false);
    } else {
      schedule();
    }
    return () => clearTimeout(timer.current);
  }, [blocked, schedule]);

  /** Tap on the stage. */
  const toggle = useCallback(() => {
    if (!isPhone() || blocked) return;
    setHidden((h) => {
      const next = !h;
      if (!next) schedule();
      return next;
    });
  }, [blocked, schedule]);

  /** Any interaction with the controls keeps them up a while longer. */
  const poke = useCallback(() => {
    setHidden(false);
    schedule();
  }, [schedule]);

  return { hidden: hidden && !blocked, toggle, poke };
}
