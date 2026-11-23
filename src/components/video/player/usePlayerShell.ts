'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Player } from './usePlayer';

type ScreenWithLock = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> };
type IOSVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * The frame around the video: controls that hide while playing, full screen
 * (landscape on phones), picture-in-picture, and YouTube keyboard shortcuts.
 */
export function usePlayerShell(player: Player, containerRef: RefObject<HTMLDivElement | null>, onToggleTheater?: () => void) {
  const { state: s, actions: a, videoRef } = player;
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pipSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;

  // ── Controls: shown on activity, hidden 3 s into playback ──────────────
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);
  useEffect(() => {
    if (!s.playing) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setControlsVisible(true);
    } else showControls();
  }, [s.playing, showControls]);
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  // ── Full screen (landscape on phones; iOS uses the native player) ──────
  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (el.requestFullscreen) {
      await el.requestFullscreen().catch(() => {});
      if (!s.isVertical) await (screen.orientation as ScreenWithLock)?.lock?.('landscape').catch(() => {});
    } else {
      (videoRef.current as IOSVideo | null)?.webkitEnterFullscreen?.();
    }
  }, [containerRef, videoRef, s.isVertical]);
  useEffect(() => {
    const onChange = () => {
      const on = Boolean(document.fullscreenElement);
      setFullscreen(on);
      if (!on) screen.orientation?.unlock?.();
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture().catch(() => {});
    else await video.requestPictureInPicture().catch(() => {});
  }, [videoRef]);

  // ── Keyboard (YouTube keys), unless typing or a dialog is open ─────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role=dialog][aria-modal=true]')) return;
      const key = e.key.toLowerCase();
      const handled = () => { e.preventDefault(); showControls(); };
      if (key === 'k' || (key === ' ' && t?.tagName !== 'BUTTON')) { handled(); a.toggle(); }
      else if (key === 'j') { handled(); a.seekBy(-10); }
      else if (key === 'l') { handled(); a.seekBy(10); }
      else if (key === 'arrowleft' && t?.getAttribute('role') !== 'slider') { handled(); a.seekBy(-5); }
      else if (key === 'arrowright' && t?.getAttribute('role') !== 'slider') { handled(); a.seekBy(5); }
      else if (key === 'arrowup') { handled(); a.setVolume(s.volume + 0.05); }
      else if (key === 'arrowdown') { handled(); a.setVolume(s.volume - 0.05); }
      else if (key === 'm') { handled(); a.toggleMute(); }
      else if (key === 'f') { handled(); void toggleFullscreen(); }
      else if (key === 't' && onToggleTheater) { handled(); onToggleTheater(); }
      else if (/^[0-9]$/.test(key) && s.duration) { handled(); a.seek((Number(key) / 10) * s.duration); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [a, s.volume, s.duration, showControls, toggleFullscreen, onToggleTheater]);

  return { controlsVisible, setControlsVisible, showControls, fullscreen, toggleFullscreen, togglePip, pipSupported };
}
