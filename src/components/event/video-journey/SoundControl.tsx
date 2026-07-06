'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

interface SoundControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
}

const SoundControl = React.memo(function SoundControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: SoundControlProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(Number(e.target.value) / 100);
    },
    [onVolumeChange]
  );

  const effectiveVolume = isMuted ? 0 : volume;
  const displayVolume = Math.round(effectiveVolume * 100);

  const VolumeIcon = isMuted || effectiveVolume === 0
    ? VolumeX
    : effectiveVolume <= 0.3
    ? Volume1
    : Volume2;

  const showSlider = isMobile || isHovered;

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Mute button */}
      <button
        type="button"
        onClick={onMuteToggle}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="text-[#f2f2f2] hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#6a57e5] rounded p-1 transition-opacity"
      >
        <VolumeIcon size={20} />
      </button>

      {/* Volume slider */}
      {(showSlider) && (
        <div className="flex items-center gap-2">
          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={100}
            value={displayVolume}
            onChange={handleSliderChange}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={displayVolume}
            className="w-20 h-1 appearance-none rounded-full bg-[rgba(242,242,242,0.15)] cursor-pointer accent-[#6a57e5]"
            style={{
              background: `linear-gradient(to right, #6a57e5 0%, #6a57e5 ${displayVolume}%, rgba(242,242,242,0.15) ${displayVolume}%, rgba(242,242,242,0.15) 100%)`,
            }}
          />
        </div>
      )}
    </div>
  );
});

export default SoundControl;