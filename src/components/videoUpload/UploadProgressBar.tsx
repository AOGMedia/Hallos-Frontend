'use client';

import type { UploadState } from './uploadEngine';
import { UploadBar, UploadDetail, uploadStatusText } from './UploadStatus';

interface UploadProgressBarProps {
  progress: number;
  fileName: string;
  onCancel: () => void;
  /** The real upload (size, speed, time left, paused…). Without it, the bar alone. */
  upload?: UploadState;
  /** Shown when the upload stopped. */
  onRetry?: () => void;
}

export function UploadProgressBar({ progress, fileName, onCancel, upload, onRetry }: UploadProgressBarProps) {
  const heading = upload ? uploadStatusText(upload).heading : 'Uploading a file';
  const finished = upload?.phase === 'done';
  return (
    <div className="flex flex-col gap-2 w-full ">
      <h1>{heading || 'Uploading a file'}</h1>
      <div className="flex items-center justify-between ">
        <p className="text-xs text-text-primary truncate flex-1 mr-4">
          {fileName}
        </p>
      </div>

      {upload?.phase !== 'waiting' && <UploadBar percent={progress} />}
      {upload && <UploadDetail state={upload} />}

      <div className="flex items-center gap-6">
        {upload?.phase === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            className="self-start text-regular text-text-primary hover:text-[#00FF40] transition-colors cursor-pointer"
          >
            Try again
          </button>
        )}
        {!finished && (
          <button
            onClick={onCancel}
            className="self-start text-regular text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
