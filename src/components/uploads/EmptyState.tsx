import Link from 'next/link';
import { Upload, Video } from 'lucide-react';

interface EmptyStateProps {
  type: 'videos' | 'shorts';
}

export function EmptyState({ type }: EmptyStateProps) {
  const isVideos = type === 'videos';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[rgba(242,242,242,0.04)] border border-[rgba(234,234,234,0.10)] flex items-center justify-center">
          {isVideos ? (
            <Video className="w-10 h-10 text-[#888c94]" />
          ) : (
            <Upload className="w-10 h-10 text-[#888c94]" />
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-[#f2f2f2]">
            No {isVideos ? 'videos' : 'shorts'} yet
          </h3>
          <p className="text-base text-[rgba(242,242,242,0.80)]">
            Start creating and uploading your {isVideos ? 'videos' : 'shorts'} to share with your audience.
            Your content will appear here once uploaded.
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/dashboard/create"
          className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span>Upload {isVideos ? 'Video' : 'Short'}</span>
        </Link>
      </div>
    </div>
  );
}