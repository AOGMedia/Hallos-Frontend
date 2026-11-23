'use client';

import { memo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from './player/usePlayer';
import { usePlayerShell } from './player/usePlayerShell';
import { PlayerControls } from './player/PlayerControls';
import { SettingsMenu } from './player/SettingsMenu';
import { GestureLayer } from './player/GestureLayer';
import { CenterControls, PlayerStatus, ResumePrompt, StartButton } from './player/PlayerOverlays';
import type { VideoPlayerProps } from '@/types/video';

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/**
 * The video player: YouTube-style on desktop (click to play, keyboard keys,
 * theater, picture-in-picture), app-style on phones (tap for controls,
 * double-tap to skip, big centre buttons, settings as a bottom sheet).
 * The pieces live in ./player; this only puts them together.
 */
function VideoPlayerComponent({ videoUrl, thumbnail, title, videoId, theater, onToggleTheater, onBack }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const player = usePlayer(videoUrl, videoId);
  const shell = usePlayerShell(player, containerRef, onToggleTheater);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [touch] = useState(isTouch);
  const { state: s, actions: a } = player;
  const chromeVisible = shell.controlsVisible || !s.playing || settingsOpen;

  return (
    <div
      ref={containerRef}
      className={cn(
        'group/player relative mx-auto w-full overflow-hidden bg-black select-none',
        shell.fullscreen ? 'h-full' : s.isVertical ? 'aspect-[9/16] max-h-[75dvh]' : 'aspect-video max-h-[calc(100dvh-120px)]',
        !shell.fullscreen && !theater && 'md:rounded-xl'
      )}
      onPointerMove={(e) => e.pointerType === 'mouse' && shell.showControls()}
      onMouseLeave={() => s.playing && !settingsOpen && shell.setControlsVisible(false)}
      aria-label={`Video player: ${title}`}
    >
      <video
        ref={player.videoRef}
        className="h-full w-full object-contain"
        poster={thumbnail}
        playsInline
        preload="metadata"
      />

      <GestureLayer
        onTap={(pointer) => {
          if (pointer === 'mouse') a.toggle();
          else if (chromeVisible && s.playing) shell.setControlsVisible(false);
          else shell.showControls();
        }}
        onDoubleTap={(side, pointer) => {
          if (pointer === 'mouse') void shell.toggleFullscreen();
          else { a.seekBy(side === 'left' ? -10 : 10); shell.showControls(); }
        }}
      />

      {/* Top bar: back (phones, like the YouTube app) */}
      {onBack && !shell.fullscreen && (
        <div className={`absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-2 transition-opacity md:hidden ${chromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/15" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <StartButton player={player} />
      {touch && <CenterControls player={player} visible={chromeVisible} />}
      <PlayerStatus player={player} />
      <ResumePrompt player={player} />

      {s.started && (
        <PlayerControls
          player={player}
          visible={chromeVisible}
          compact={touch}
          fullscreen={shell.fullscreen}
          theater={theater}
          pipSupported={shell.pipSupported}
          onToggleFullscreen={() => void shell.toggleFullscreen()}
          onToggleTheater={onToggleTheater}
          onTogglePip={() => void shell.togglePip()}
          onOpenSettings={() => setSettingsOpen((o) => !o)}
        />
      )}

      <SettingsMenu
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sheet={touch}
        speed={s.speed}
        onSpeed={a.setSpeed}
        levels={s.levels}
        level={s.level}
        activeHeight={s.activeHeight}
        onLevel={a.setLevel}
      />
    </div>
  );
}

export const VideoPlayer = memo(VideoPlayerComponent);
VideoPlayer.displayName = 'VideoPlayer';
