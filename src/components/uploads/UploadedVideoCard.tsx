import Image from 'next/image';
import Link from 'next/link';
import { formatViewCount, formatTimeAgo } from '@/utils/formatters';
import type { VideoListItem } from '@/lib/api/videos';

interface UploadedVideoCardProps {
  video: VideoListItem;
}

export function UploadedVideoCard({ video }: UploadedVideoCardProps) {
  // Mock data for demonstration - in production, these would come from the API
  const description = 'Description appears here\n...and wraps here';
  const postedDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000); // 28 days ago
  const rating = 0;
  const ratingCount = 0;

  return (
    <Link
      href={`/dashboard/video/${video.id}`}
      className="group relative w-full sm:w-[322px] flex-shrink-0"
    >
      {/* Card Container */}
      <div className="rounded-[15px] border border-[rgba(234,234,234,0.10)] bg-[rgba(242,242,242,0.04)] overflow-hidden flex flex-col gap-[15.09px]">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video">
          <Image
            src={video.thumbnailUrl || '/images/video-placeholder.svg'}
            alt={video.title}
            fill
            className="object-cover"
          />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                <path d="M0 0V18L14 9L0 0Z" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-[15px] pb-[15px] flex flex-col gap-[22.63px]">
          {/* Title and Description */}
          <div className="flex flex-col gap-[9.43px]">
            <h3 className="text-base font-bold leading-4 text-[#f2f2f2] line-clamp-1">
              {video.title}
            </h3>
            <p className="text-sm font-normal leading-[21px] text-[rgba(242,242,242,0.80)] line-clamp-2">
              {description}
            </p>
          </div>

          {/* Metadata */}
          <div className="rounded-[94px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-[15.09px]">
              {/* Views */}
              <div className="flex items-center gap-[5.66px]">
                <Image
                  src="/icons/eye.svg"
                  alt=""
                  width={20}
                  height={17}
                  className="w-5 h-[17px]"
                />
                <span className="text-xs font-normal leading-3 text-[#f2f2f2]">
                  {formatViewCount(video.viewsCount || 0)} views
                </span>
              </div>

              {/* Posted Date */}
              <div className="flex items-center gap-[5.66px]">
                <Image
                  src="/icons/import.svg"
                  alt=""
                  width={16}
                  height={17}
                  className="w-4 h-[17px]"
                />
                <span className="text-xs font-normal leading-3 text-[#f2f2f2]">
                  {formatTimeAgo(postedDate)}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-[7.54px]">
              <Image
                src="/icons/star-filled.svg"
                alt=""
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span className="text-xs font-normal leading-3 text-[#f2f2f2]">
                {rating} ({ratingCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border border-[rgba(234,234,234,0.10)] pointer-events-none" />
    </Link>
  );
}