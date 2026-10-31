import Link from 'next/link';
import { Clock } from 'lucide-react';
import { GeneratedCourseThumbnail } from '@/components/course/GeneratedCourseThumbnail';
import { courseSummary, coursePath } from '@/lib/courses/catalog';
import type { PublicCourse } from '@/lib/seo/publicApi';

/**
 * Course card for the public catalog. Deliberately shows no enrolment counts
 * or star ratings: the dashboard's are generated placeholders, and placeholder
 * social proof must never appear on public, crawlable pages.
 */
export function PublicCourseCard({ course, eager = false }: { course: PublicCourse; eager?: boolean }) {
  const summary = courseSummary(course.content);

  return (
    <Link
      href={coursePath(course.id)}
      className="group flex flex-col rounded-xl border border-border overflow-hidden hover:border-accent-cyan/40 transition-colors bg-white/[0.02]"
    >
      <div className="relative h-36 bg-white/5 overflow-hidden">
        {course.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- course images come from arbitrary hosts
          <img
            src={course.imageUrl}
            alt={course.name}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <GeneratedCourseThumbnail courseId={course.id} courseTitle={course.name} className="w-full h-full" showFirstLetter />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <h3 className="text-base font-semibold text-text-primary line-clamp-2 group-hover:text-accent-cyan transition-colors">
          {course.name}
        </h3>
        {summary && <p className="text-sm text-text-secondary line-clamp-2">{summary}</p>}
        {course.duration && (
          <p className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-text-secondary">
            <Clock size={13} aria-hidden="true" /> {course.duration} · Self-paced · Certificate
          </p>
        )}
      </div>
    </Link>
  );
}
