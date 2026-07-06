'use client';

import { memo } from 'react';
import Image from 'next/image';
import { formatDuration, formatTimeAgo, formatRating } from '@/utils/formatters';
import type { VideoMetadataProps } from '@/types/video';

function VideoMetadataComponent({ 
  duration, 
  postedDate, 
  rating, 
  ratingCount 
}: VideoMetadataProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-background-dark/50 rounded-full px-4 py-2.5">
      <div className="flex items-center gap-3">
        {/* Duration */}
        <div className="flex items-center gap-1.5">
          <Image 
            src="/icons/clock.svg" 
            alt="Duration" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
          <span className="text-xs text-text-primary">
            {formatDuration(duration)}
          </span>
        </div>
        
        {/* Posted Time */}
        <div className="flex items-center gap-1.5">
          <Image 
            src="/icons/import.svg" 
            alt="Posted" 
            width={17} 
            height={18}
            className="w-[17px] h-[18px]"
          />
          <span className="text-xs text-text-primary">
            {formatTimeAgo(postedDate)}
          </span>
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-2">
        <Image 
          src="/icons/star.svg" 
          alt="Rating" 
          width={21} 
          height={21}
          className="w-[21px] h-[21px]"
        />
        <span className="text-xs text-text-primary">
          {formatRating(rating, ratingCount)}
        </span>
      </div>
    </div>
  );
}

export const VideoMetadata = memo(VideoMetadataComponent);
VideoMetadata.displayName = 'VideoMetadata';