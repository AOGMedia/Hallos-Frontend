/**
 * GeneratedCourseThumbnail Component
 * 
 * Renders a deterministic gradient-based thumbnail for courses without real images.
 * The gradient is selected based on the course ID, ensuring consistency across renders.
 */

import { getCourseGradient } from '@/lib/courseVisuals';

export interface GeneratedCourseThumbnailProps {
  /** Course identifier used to select gradient */
  courseId: string | number;
  /** Course title to display on thumbnail */
  courseTitle: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** Whether to show first letter as visual enhancer */
  showFirstLetter?: boolean;
}

/**
 * Generates a gradient-based thumbnail with course title overlay
 */
export function GeneratedCourseThumbnail({
  courseId,
  courseTitle,
  className = '',
  showFirstLetter = false
}: GeneratedCourseThumbnailProps) {
  const gradient = getCourseGradient(courseId);
  const displayTitle = courseTitle || 'Untitled Course';
  const firstLetter = displayTitle.charAt(0).toUpperCase();

  return (
    <div
      className={`relative overflow-hidden rounded-lg flex items-end ${className}`}
      style={{ background: gradient.gradient }}
    >
      {/* Optional first letter watermark */}
      {showFirstLetter && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span
            className="text-[120px] sm:text-[160px] font-bold leading-none select-none"
            style={{ color: gradient.textColor }}
            aria-hidden="true"
          >
            {firstLetter}
          </span>
        </div>
      )}

      {/* Course title overlay */}
      <div className="relative w-full p-3 sm:p-4">
        <h3
          className="text-sm sm:text-base font-semibold leading-tight line-clamp-2"
          style={{ color: gradient.textColor }}
        >
          {displayTitle}
        </h3>
      </div>
    </div>
  );
}
