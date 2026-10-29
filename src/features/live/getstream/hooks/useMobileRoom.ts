"use client";

import { useEffect } from "react";

/**
 * Makes the room behave like a native app on phones while it's open:
 *   - keeps the screen awake (Screen Wake Lock, re-acquired after the tab
 *     comes back, since browsers release it when hidden),
 *   - stops the page itself from scrolling or rubber-banding behind the room,
 *   - exposes the on-screen keyboard height as --kb-inset so bottom sheets
 *     sit above the keyboard (iOS doesn't resize the layout for it).
 * Everything is undone when the room closes.
 */
export function useMobileRoom() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const saved = {
      rootOverscroll: root.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
    };
    root.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";

    // Keyboard inset (visualViewport is the part of the page the user can see).
    const viewport = window.visualViewport;
    let frame = 0;
    const updateInset = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!viewport) return;
        const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        root.style.setProperty("--kb-inset", `${Math.round(inset)}px`);
      });
    };
    viewport?.addEventListener("resize", updateInset);
    viewport?.addEventListener("scroll", updateInset);
    updateInset();

    // Keep the screen on.
    type Sentinel = { release: () => Promise<void> };
    let wakeLock: Sentinel | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<Sentinel> } };
    const requestWakeLock = async () => {
      if (!nav.wakeLock || document.visibilityState !== "visible") return;
      try {
        wakeLock = await nav.wakeLock.request("screen");
      } catch {
        // Not allowed (e.g. battery saver) — the class works the same.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    void requestWakeLock();

    return () => {
      root.style.overscrollBehavior = saved.rootOverscroll;
      body.style.overscrollBehavior = saved.bodyOverscroll;
      body.style.overflow = saved.bodyOverflow;
      root.style.removeProperty("--kb-inset");
      viewport?.removeEventListener("resize", updateInset);
      viewport?.removeEventListener("scroll", updateInset);
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      void wakeLock?.release().catch(() => {});
    };
  }, []);
}
