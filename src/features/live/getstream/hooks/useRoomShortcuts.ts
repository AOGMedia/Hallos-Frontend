"use client";

import { useEffect, useRef } from "react";

/**
 * Google Meet's keyboard shortcuts (desktop):
 *   Ctrl/⌘ + D        microphone
 *   Ctrl/⌘ + E        camera
 *   Ctrl/⌘ + Alt + H  raise / lower hand
 * Ignored while typing (chat box, search).
 */
export function useRoomShortcuts(actions: { toggleMic: () => void; toggleCamera: () => void; toggleHand: () => void }) {
  const latest = useRef(actions);
  latest.current = actions;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (e.altKey && key === "h") {
        e.preventDefault();
        latest.current.toggleHand();
      } else if (!e.altKey && key === "d") {
        e.preventDefault();
        latest.current.toggleMic();
      } else if (!e.altKey && key === "e") {
        e.preventDefault();
        latest.current.toggleCamera();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
