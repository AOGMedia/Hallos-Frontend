'use client';

import { formatProgress } from '@/utils/videoUploadFormatters';

interface PublishingProgressProps {
  progress: number;
  fileName: string;
  onCancel?: () => void;
}

export function PublishingProgress({ progress, fileName }: PublishingProgressProps) {
  return (
    <div className="flex flex-col items-start gap-4 p-12">
      <h3 className="text-medium text-text-primary">Publishing post</h3>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <p className="text-sm text-[#F2F2F2] truncate md:pb-12">
          {fileName}
        </p>
        
        <div className="relative w-full h-1 bg-background-dark rounded-full overflow-visible">
          <div 
            className="h-full bg-[#00FF40] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
           <div 
            className="absolute -top-4 w-0.5 h-5 transition-all duration-300"
            style={{ 
              left: `${Math.max(0, Math.min(progress, 100))}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(180deg, rgba(0, 255, 64, 0) 0%, #00FF40 100%)'
            }}
          />
          <span 
            className="absolute -top-7 text-xs text-[#00FF40] transition-all duration-300"
            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
          >
            {formatProgress(progress)}
          </span>
        </div>
      </div>
    </div>
  );
}