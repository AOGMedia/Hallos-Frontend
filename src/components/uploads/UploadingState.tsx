import { Loader2, TrashIcon } from 'lucide-react';

interface UploadingStateProps {
  title: string;
  type: 'videos' | 'shorts';
  onDelete?: () => void;
}

export function UploadingState({ title, type, onDelete }: UploadingStateProps) {
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
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Upload"
          >
            <TrashIcon className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Thumbnail Placeholder with Loading Animation */}
        <div className="relative w-full aspect-video bg-[rgba(242,242,242,0.08)] flex items-center justify-center">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(242,242,242,0.05)] to-transparent animate-shimmer" />
          
          {/* Loading Icon */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#888c94] animate-spin" />
            <span className="text-sm font-medium text-[#888c94]">
              Processing {type === 'videos' ? 'video' : 'short'}...
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
              Your {type === 'videos' ? 'video' : 'short'} is being prepared. This may take a few minutes.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[rgba(242,242,242,0.08)] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-progress" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}