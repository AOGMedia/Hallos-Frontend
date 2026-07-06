'use client';

import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Play, Pause, Volume2, Volume1, VolumeX,
  Maximize, Minimize, SkipBack, SkipForward, Settings, Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/lib/video/playerUtils';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  showControls: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number[]) => void;
  onSeek: (value: number[]) => void;
  onSkip: (seconds: number) => void;
  onSetSpeed: (speed: number) => void;
  onToggleFullscreen: () => void;
  onShare: () => void;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoControls({
  isPlaying, isMuted, volume, progress, currentTime, duration,
  playbackSpeed, isFullscreen, showControls,
  onTogglePlay, onToggleMute, onVolumeChange, onSeek, onSkip,
  onSetSpeed, onToggleFullscreen, onShare,
}: VideoControlsProps) {
  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4"
          initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-3">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-mono min-w-[45px]">{formatTime(currentTime)}</span>
              <Slider value={[progress]} onValueChange={onSeek} max={100} step={0.1} className="flex-1" />
              <span className="text-white text-xs font-mono min-w-[45px]">{formatTime(duration)}</span>
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-1">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button onClick={onTogglePlay} variant="outline" size="sm" className="text-white hover:bg-primary">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button onClick={() => onSkip(-10)} variant="outline" size="sm" className="text-white hover:bg-primary">
                    <SkipBack className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button onClick={() => onSkip(10)} variant="outline" size="sm" className="text-white hover:bg-primary">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </motion.div>
                {/* Volume */}
                <div className="flex items-center gap-1 group">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button onClick={onToggleMute} variant="primary" size="sm" className="text-white hover:bg-white/20">
                      {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : volume > 0.5 ? <Volume2 className="h-5 w-5" /> : <Volume1 className="h-5 w-5" />}
                    </Button>
                  </motion.div>
                  <div className="w-0 group-hover:w-24 transition-all duration-200 overflow-hidden">
                    <Slider value={[isMuted ? 0 : volume * 100]} onValueChange={onVolumeChange} max={100} step={1} className="w-full" />
                  </div>
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="outline" size="sm" className="text-white hover:bg-primary">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background/95 backdrop-blur-sm">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium">Playback Speed</span>
                      <div className="grid grid-cols-3 gap-1">
                        {SPEEDS.map(speed => (
                          <Button key={speed} onClick={() => onSetSpeed(speed)}
                            variant={playbackSpeed === speed ? 'primary' : 'outline'} size="sm" className="text-xs">
                            {speed}x
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button onClick={onShare} variant="outline" size="sm" className="text-white hover:bg-primary" title="Share">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button onClick={onToggleFullscreen} variant="outline" size="sm" className="text-white hover:bg-primary">
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
