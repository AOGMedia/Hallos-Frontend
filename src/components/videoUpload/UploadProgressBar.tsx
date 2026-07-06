'use client';

// import { formatProgress } from '@/utils/videoUploadFormatters';

interface UploadProgressBarProps {
  progress: number;
  fileName: string;
  onCancel: () => void;
}

export function UploadProgressBar({ progress, fileName, onCancel }: UploadProgressBarProps) {
  return (
    <div className="flex flex-col gap-2 w-full ">
      <h1>Uploading a file</h1>
      <div className="flex items-center justify-between ">
        <p className="text-xs text-text-primary truncate flex-1 mr-4">
          {fileName}
        </p>
        {/* <span className="text-xs text-text-primary">
          {formatProgress(progress)}
        </span> */}
      </div>
      
      <div className="w-full h-1 bg-background-dark rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#00FF40] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        onClick={onCancel}
        className="self-start text-regular text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        Cancel 
      </button>
    </div>
  );
}