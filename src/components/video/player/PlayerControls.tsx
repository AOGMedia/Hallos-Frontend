'use client';

import { Maximize, Minimize, Pause, PictureInPicture2, Play, RectangleHorizontal, Settings, Volume1, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/video/playerUtils';
import { ProgressBar } from './ProgressBar';
import type { Player } from './usePlayer';

interface PlayerControlsProps {
  player: Player;
  visible: boolean;
  compact: boolean;
  fullscreen: boolean;
  theater?: boolean;
  pipSupported: boolean;
  onToggleFullscreen: () => void;
  onToggleTheater?: () => void;
  onTogglePip: () => void;
  onOpenSettings: () => void;
}

const btn = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:scale-95';

/** The bar along the bottom: seek bar, then play, volume, time … settings, theater, PiP, fullscreen. */
export function PlayerControls({
  player, visible, compact, fullscreen, theater, pipSupported, onToggleFullscreen, onToggleTheater, onTogglePip, onOpenSettings,
}: PlayerControlsProps) {
  const { state: s, actions: a } = player;
  const VolumeIcon = s.muted || s.volume === 0 ? VolumeX : s.volume > 0.5 ? Volume2 : Volume1;

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-1 pt-10 transition-opacity duration-200 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ProgressBar currentTime={s.currentTime} duration={s.duration} bufferedEnd={s.bufferedEnd} onSeek={a.seek} />
      <div className="flex items-center gap-1">
        {!compact && (
          <button type="button" className={btn} onClick={a.toggle} aria-label={s.playing ? 'Pause (k)' : 'Play (k)'}>
            {s.playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>
        )}
        {!compact && (
          <div className="group/vol flex items-center">
            <button type="button" className={btn} onClick={a.toggleMute} aria-label={s.muted ? 'Unmute (m)' : 'Mute (m)'}>
              <VolumeIcon className="h-5 w-5" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.muted ? 0 : s.volume}
              onChange={(e) => a.setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 accent-white transition-all duration-200 group-hover/vol:mr-2 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:mr-2 focus:w-20 focus:opacity-100"
            />
          </div>
        )}
        <span className="px-2 text-xs font-medium tabular-nums text-white/90 sm:text-[13px]">
          {formatTime(s.currentTime)} <span className="text-white/60">/ {formatTime(s.duration)}</span>
        </span>

        <div className="ml-auto flex items-center gap-0.5">
          <button type="button" className={btn} onClick={onOpenSettings} aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
          {!compact && onToggleTheater && !fullscreen && (
            <button type="button" className={btn} onClick={onToggleTheater} aria-label={theater ? 'Default view (t)' : 'Theater mode (t)'}>
              <RectangleHorizontal className={`h-5 w-5 ${theater ? 'scale-x-75' : ''}`} />
            </button>
          )}
          {!compact && pipSupported && (
            <button type="button" className={btn} onClick={onTogglePip} aria-label="Picture in picture">
              <PictureInPicture2 className="h-5 w-5" />
            </button>
          )}
          <button type="button" className={btn} onClick={onToggleFullscreen} aria-label={fullscreen ? 'Exit full screen (f)' : 'Full screen (f)'}>
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
