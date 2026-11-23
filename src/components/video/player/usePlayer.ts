'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

/**
 * Everything about playing one video: streaming (HLS with automatic recovery
 * on bad networks), time and buffering, volume, speed, quality, and
 * "continue where you left off". UI components only read and call this.
 */

export interface QualityLevel { index: number; height: number }

const RESUME_KEY = (id: string) => `hallos:watch:${id}`;
const VOLUME_KEY = 'hallos:player-volume';
const MAX_NETWORK_RETRIES = 4;

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string | null) => {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* private mode */ }
};

export function usePlayer(videoUrl: string | undefined, videoId?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [level, setLevelState] = useState(-1); // -1 = auto
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const [isVertical, setIsVertical] = useState(false);

  // ── Source (HLS with recovery) ──────────────────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    setError(null);
    const saved = Number(read(VOLUME_KEY));
    if (saved >= 0 && saved <= 1 && read(VOLUME_KEY) !== null) { el.volume = saved; setVolumeState(saved); }

    if (!/\.m3u8(\?|$)/.test(videoUrl)) { el.src = videoUrl; return; }
    if (!Hls.isSupported()) {
      if (el.canPlayType('application/vnd.apple.mpegurl')) el.src = videoUrl; // Safari / iOS
      else setError('This browser can’t play this video.');
      return;
    }
    let networkRetries = 0;
    const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 30, backBufferLength: 60 });
    hlsRef.current = hls;
    hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
      setLevels(data.levels.map((l, index) => ({ index, height: l.height })).filter((l) => l.height > 0).sort((a, b) => b.height - a.height));
    });
    hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => setActiveHeight(hls.levels[data.level]?.height ?? null));
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries < MAX_NETWORK_RETRIES) {
        networkRetries += 1;
        setWaiting(true);
        setTimeout(() => hls.startLoad(), 1500 * networkRetries); // back off on bad networks
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        setError('We couldn’t load this video. Check your connection and try again.');
      }
    });
    hls.loadSource(videoUrl);
    hls.attachMedia(el);
    return () => { hls.destroy(); hlsRef.current = null; };
  }, [videoUrl, attempt]);

  // ── Media events ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const on: Record<string, () => void> = {
      play: () => { setPlaying(true); setStarted(true); setEnded(false); },
      pause: () => setPlaying(false),
      waiting: () => setWaiting(true),
      playing: () => setWaiting(false),
      canplay: () => setWaiting(false),
      ended: () => { setEnded(true); setPlaying(false); if (videoId) write(RESUME_KEY(videoId), null); },
      volumechange: () => { setVolumeState(el.volume); setMuted(el.muted); write(VOLUME_KEY, String(el.volume)); },
      ratechange: () => setSpeedState(el.playbackRate),
      error: () => { if (!hlsRef.current) setError('We couldn’t load this video. Check your connection and try again.'); },
      loadedmetadata: () => {
        setDuration(el.duration || 0);
        setIsVertical(el.videoWidth > 0 && el.videoWidth / el.videoHeight < 1);
        const saved = videoId ? Number(read(RESUME_KEY(videoId))) : 0;
        if (saved > 10 && saved < (el.duration || 0) - 15) setResumeFrom(saved);
      },
      timeupdate: () => {
        setCurrentTime(el.currentTime);
        const b = el.buffered;
        for (let i = 0; i < b.length; i++) if (b.start(i) <= el.currentTime + 0.5) setBufferedEnd(b.end(i));
      },
      progress: () => { const b = el.buffered; if (b.length) setBufferedEnd(b.end(b.length - 1)); },
    };
    Object.entries(on).forEach(([event, fn]) => el.addEventListener(event, fn));
    return () => Object.entries(on).forEach(([event, fn]) => el.removeEventListener(event, fn));
  }, [videoId]);

  // Remember where they are (every few seconds while playing).
  useEffect(() => {
    if (!playing || !videoId) return;
    const timer = setInterval(() => {
      const el = videoRef.current;
      if (el && el.currentTime > 10 && el.currentTime < el.duration - 15) write(RESUME_KEY(videoId), String(Math.floor(el.currentTime)));
    }, 5000);
    return () => clearInterval(timer);
  }, [playing, videoId]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const play = useCallback(() => { void videoRef.current?.play().catch(() => {}); }, []);
  const toggle = useCallback(() => { const el = videoRef.current; if (!el) return; if (el.paused || el.ended) play(); else el.pause(); }, [play]);
  const seek = useCallback((time: number) => {
    const el = videoRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.max(0, Math.min(el.duration, time));
    setCurrentTime(el.currentTime);
    setResumeFrom(null);
  }, []);
  const seekBy = useCallback((delta: number) => { const el = videoRef.current; if (el) seek(el.currentTime + delta); }, [seek]);
  const setVolume = useCallback((v: number) => { const el = videoRef.current; if (!el) return; el.volume = Math.max(0, Math.min(1, v)); el.muted = el.volume === 0; }, []);
  const toggleMute = useCallback(() => { const el = videoRef.current; if (!el) return; el.muted = !el.muted; if (!el.muted && el.volume === 0) el.volume = 0.5; }, []);
  const setSpeed = useCallback((s: number) => { if (videoRef.current) videoRef.current.playbackRate = s; }, []);
  const setLevel = useCallback((index: number) => { if (hlsRef.current) hlsRef.current.currentLevel = index; setLevelState(index); }, []);
  const retry = useCallback(() => { setError(null); setWaiting(true); setAttempt((n) => n + 1); }, []);
  const resume = useCallback(() => { if (resumeFrom !== null) { seek(resumeFrom); play(); } }, [resumeFrom, seek, play]);
  const dismissResume = useCallback(() => setResumeFrom(null), []);

  return {
    videoRef,
    state: { playing, started, ended, waiting, error, currentTime, duration, bufferedEnd, volume, muted, speed, levels, level, activeHeight, resumeFrom, isVertical },
    actions: { play, toggle, seek, seekBy, setVolume, toggleMute, setSpeed, setLevel, retry, resume, dismissResume },
  };
}

export type Player = ReturnType<typeof usePlayer>;
