import { AlertCircle, FileEdit, Loader2, TrashIcon, UploadCloud } from 'lucide-react';

/**
 * - processing: Mux is preparing it (the original card, unchanged).
 * - uploading:  the file is going up right now in this tab (real progress).
 * - draft:      uploaded, but not published yet.
 * - unfinished: the upload stopped (tab closed, connection lost); pick the file again.
 * - failed:     it couldn't be processed.
 */
export type UploadCardVariant = 'processing' | 'uploading' | 'draft' | 'unfinished' | 'failed';

interface UploadingStateProps {
  title: string;
  type: 'videos' | 'shorts';
  onDelete?: () => void;
  variant?: UploadCardVariant;
  /** 0 to 100, for "uploading". */
  progress?: number;
  /** "Finish": continue a draft or an unfinished upload. */
  onFinish?: () => void;
}

export function UploadingState({ title, type, onDelete, variant = 'processing', progress, onFinish }: UploadingStateProps) {
  const noun = type === 'videos' ? 'video' : 'short';
  const copy: Record<UploadCardVariant, { label: string; body: string }> = {
    processing: { label: `Processing ${noun}...`, body: `Your ${noun} is being prepared. This may take a few minutes.` },
    uploading: { label: `Uploading ${Math.round(progress ?? 0)}%`, body: `Your ${noun} is uploading. Keep this tab open until it finishes.` },
    draft: { label: 'Draft', body: `Uploaded but not published yet. Finish the details to publish it.` },
    unfinished: { label: 'Upload didn’t finish', body: `The upload stopped before the end. Pick the file again to finish it.` },
    failed: { label: 'Couldn’t process', body: `We couldn’t process this ${noun}. Delete it and upload it again.` },
  };
  const Icon = variant === 'failed' || variant === 'unfinished' ? AlertCircle : variant === 'draft' ? FileEdit : variant === 'uploading' ? UploadCloud : Loader2;
  const animated = variant === 'processing';

  return (
    <div className="relative w-full sm:w-[322px] flex-shrink-0 group">
      {/* Card Container */}
      <div className="relative rounded-[15px] border border-[rgba(234,234,234,0.10)] bg-[rgba(242,242,242,0.04)] overflow-hidden flex flex-col gap-[15.09px]">
        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete Upload"
            aria-label="Delete upload"
          >
            <TrashIcon className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Thumbnail Placeholder with Loading Animation */}
        <div className="relative w-full aspect-video bg-[rgba(242,242,242,0.08)] flex items-center justify-center">
          {/* Animated gradient background */}
          {(animated || variant === 'uploading') && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(242,242,242,0.05)] to-transparent animate-shimmer" />
          )}

          {/* Loading Icon */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <Icon className={`w-10 h-10 ${variant === 'failed' ? 'text-accent-red' : 'text-[#888c94]'} ${animated ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-[#888c94]">
              {copy[variant].label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-[15px] pb-[15px] flex flex-col gap-[22.63px]">
          {/* Title */}
          <div className="flex flex-col gap-[9.43px]">
            <h3 className="text-base font-bold leading-4 text-[#f2f2f2] line-clamp-1">
              {title}
            </h3>
            <p className="text-sm font-normal leading-[21px] text-[rgba(242,242,242,0.80)]">
              {copy[variant].body}
            </p>
          </div>

          {/* Progress Bar */}
          {variant === 'processing' && (
            <div className="w-full h-2 bg-[rgba(242,242,242,0.08)] rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-progress" style={{ width: '60%' }} />
            </div>
          )}
          {variant === 'uploading' && (
            <div className="w-full h-2 bg-[rgba(242,242,242,0.08)] rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress ?? 0}%` }} />
            </div>
          )}
          {onFinish && (variant === 'draft' || variant === 'unfinished') && (
            <button
              onClick={onFinish}
              className="self-start rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/80"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
