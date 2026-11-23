'use client';

import { Loader2, Pause, Play, RotateCcw, RotateCw, WifiOff, X } from 'lucide-react';
import { formatTime } from '@/lib/video/playerUtils';
import type { Player } from './usePlayer';

/** Buffering spinner, error with retry, and the "Replay" screen at the end. */
export function PlayerStatus({ player }: { player: Player }) {
  const { state: s, actions: a } = player;
  if (s.error) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <WifiOff className="h-8 w-8 text-white/70" aria-hidden />
        <p className="max-w-xs text-sm text-white/85">{s.error}</p>
        <button type="button" onClick={a.retry} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/85">
          Try again
        </button>
      </div>
    );
  }
  if (s.ended) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
        <button type="button" onClick={(e) => { e.stopPropagation(); a.seek(0); a.play(); }} className="flex flex-col items-center gap-2 text-white" aria-label="Replay">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60"><RotateCcw className="h-8 w-8" /></span>
          <span className="text-sm font-medium">Replay</span>
        </button>
      </div>
    );
  }
  if (s.waiting && (s.playing || s.started)) {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-label="Loading">
        <Loader2 className="h-12 w-12 animate-spin text-white/90" />
      </div>
    );
  }
  return null;
}

/** Before the first play: the big play button over the poster. */
export function StartButton({ player }: { player: Player }) {
  if (player.state.started || player.state.error) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); player.actions.play(); }}
      className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition hover:scale-105 active:scale-95 sm:h-20 sm:w-20"
      aria-label="Play video"
    >
      <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
    </button>
  );
}

/** Phones: big play/pause with ±10 s either side, shown with the controls (like the YouTube app). */
export function CenterControls({ player, visible }: { player: Player; visible: boolean }) {
  const { state: s, actions: a } = player;
  if (!s.started || s.ended || s.error) return null;
  const round = 'flex items-center justify-center rounded-full bg-black/45 text-white active:scale-95 transition';
  return (
    <div className={`absolute inset-0 z-10 flex items-center justify-center gap-10 transition-opacity duration-200 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
      <button type="button" className={`${round} h-11 w-11`} onClick={(e) => { e.stopPropagation(); a.seekBy(-10); }} aria-label="Back 10 seconds"><RotateCcw className="h-5 w-5" /></button>
      {!s.waiting && (
        <button type="button" className={`${round} h-16 w-16`} onClick={(e) => { e.stopPropagation(); a.toggle(); }} aria-label={s.playing ? 'Pause' : 'Play'}>
          {s.playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}
        </button>
      )}
      <button type="button" className={`${round} h-11 w-11`} onClick={(e) => { e.stopPropagation(); a.seekBy(10); }} aria-label="Forward 10 seconds"><RotateCw className="h-5 w-5" /></button>
    </div>
  );
}

/** "Continue from 4:32?" for a video they started before. */
export function ResumePrompt({ player }: { player: Player }) {
  const { state: s, actions: a } = player;
  if (s.resumeFrom === null || s.ended) return null;
  return (
    <div className="absolute bottom-16 left-3 z-20 flex items-center gap-1 rounded-full bg-black/80 py-1 pl-4 pr-1 text-sm text-white shadow-lg" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={a.resume} className="py-1 font-medium hover:text-primary">
        Continue from {formatTime(s.resumeFrom)}
      </button>
      <button type="button" onClick={a.dismissResume} className="ml-1 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15" aria-label="Start from the beginning">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
