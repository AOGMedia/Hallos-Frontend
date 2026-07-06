import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GeneratedCourseThumbnail } from '@/components/course/GeneratedCourseThumbnail';

interface SpecialCourseCardProps {
  id: string;
  title: string;
  enrolled: string;
  duration: string;
  type: 'Certification' | 'Specialization' | 'Subscription';
  rating: string;
  ratingCount: string;
  description: string;
  variant?: 'default' | 'compact';
  imageUrl?: string | null; // Real course image from API
  onClick?: () => void; // Optional click handler for custom navigation
}

export const SpecialCourseCard = memo(function SpecialCourseCard({
  id,
  title,
  enrolled,
  duration,
  type,
  rating,
  ratingCount,
  description,
  imageUrl,
  onClick,
  // variant = 'default',
}: SpecialCourseCardProps) {
  // Determine if we have a real image or should use generated thumbnail
  const hasRealImage = imageUrl && imageUrl.trim() !== '';
  
  const cardContent = (
    <div
      className={`
        flex flex-col gap-3 
        rounded-2xl 
        shadow-[0px_1px_2px_rgba(16,24,40,0.05)]
        p-3
        w-full
        transition-transform hover:scale-[1.02]
        cursor-pointer
      `}
      style={{
        background: 'linear-gradient(0deg, rgba(31, 38, 54, 0.3), rgba(31, 38, 54, 0.3)), linear-gradient(0deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18))'
      }}
    >
      {/* Thumbnail - Real image or Generated */}
      <div
        className="
          relative flex-shrink-0 overflow-hidden
          w-full h-[180px] rounded-lg
        "
      >
        {hasRealImage ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50px"
          />
        ) : (
          <GeneratedCourseThumbnail
            courseId={id}
            courseTitle={title}
            className="w-full h-full"
            showFirstLetter={true}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {/* Title and Price Row */}
        <div className="flex items-center justify-between gap-2.5 min-h-[32px]">
          <h3 className="flex-1 min-w-0 text-[#f2f2f2] text-sm sm:text-base font-bold leading-5 tracking-[0.08px] line-clamp-2">
            {title}
          </h3>
          {/* {price && (
            <span className="text-[#1f2636] text-xs font-bold leading-3 bg-white rounded px-2 py-1 flex-shrink-0 self-start">
              {price}
            </span>
          )} */}
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-2.5 bg-[rgba(244,244,244,0.08)] rounded px-2.5 py-1.5 sm:px-3 sm:py-1.5 min-h-[38px]">
          {/* Enrolled */}
          <div className="flex items-center gap-2">
            <Image
              src="/icons/users.svg"
              alt="enrolled"
              width={16}
              height={16}
              className="w-4 h-[13px]"
              style={{ filter: 'brightness(0) saturate(100%) invert(87%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(86%)' }}
            />
            <span className="text-[#dbdbdb] text-xs sm:text-sm font-normal leading-[14px] tracking-[0.07px]">
              {enrolled}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5">
            <Image
              src="/icons/clock-circle.svg"
              alt="duration"
              width={13}
              height={13}
              className="w-[13px] h-[13px]"
              style={{ filter: 'brightness(0) saturate(100%) invert(87%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(86%)' }}
            />
            <span className="text-[#dbdbdb] text-xs font-normal leading-3">
              {duration}
            </span>
          </div>

          {/* Bookmark Icon */}
          <div className="ml-auto">
            <Image
              src="/icons/bookmark.svg"
              alt="bookmark"
              width={13}
              height={15}
              className="w-[13px] h-[15px] cursor-pointer"
              style={{ filter: 'brightness(0) saturate(100%) invert(87%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(86%)' }}
            />
          </div>
        </div>

        {/* Type and Rating Row */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-[#dbdbdb] text-xs sm:text-sm font-medium leading-[14px] tracking-[0.07px]">
            {type}
          </span>
          <div className="flex items-center gap-1.5">
            <Image
              src="/icons/star-filled.svg"
              alt="rating"
              width={14}
              height={14}
              className="w-[14px] h-[14px]"
              style={{ filter: 'brightness(0) saturate(100%) invert(85%) sepia(74%) saturate(1649%) hue-rotate(358deg) brightness(106%) contrast(101%)' }}
            />
            <span className="text-[#dbdbdb] text-xs font-normal leading-3">
              {rating}  ({ratingCount})
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#dbdbdb] text-[11px] sm:text-xs font-normal leading-[14.4px] tracking-[0.06px] line-clamp-2 min-h-[29px]">
          {description}
        </p>
      </div>
    </div>
  );

  // If onClick is provided, use div with onClick, otherwise use Link
  if (onClick) {
    return (
      <div onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/dashboard/courses/${id}`}>
      {cardContent}
    </Link>
  );
});
