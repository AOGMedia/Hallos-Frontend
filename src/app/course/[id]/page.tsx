import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Award, Clock, MonitorPlay } from 'lucide-react';
import { Footer } from '@/components/sections/Footer';
import { GeneratedCourseThumbnail } from '@/components/course/GeneratedCourseThumbnail';
import { Breadcrumbs } from '@/components/course/public/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buttonClasses } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/metadata';
import { breadcrumbSchema } from '@/lib/seo/jsonLd';
import { fetchCourse, fetchDepartments } from '@/lib/seo/publicApi';
import {
  cleanDepartmentName,
  courseSummary,
  coursePath,
  departmentPath,
  parseCourseContent,
  parseCurriculum,
} from '@/lib/courses/catalog';

/**
 * Public course page: everything a visitor needs to decide (overview,
 * curriculum, format) without signing in. "Enroll" goes to the existing
 * dashboard page, which handles sign-in and checkout.
 *
 * noindex: the course text is the provider's white-label copy, shared with
 * other sites, so these pages are for visitors and sharing, not search.
 * The department pages carry the catalog in search instead.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

// ISR with nothing prebuilt (3,000+ courses): rendered on first visit, cached for a day.
export const revalidate = 86400;

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { course } = UUID_RE.test(id) ? await fetchCourse(id) : { course: null };
  return buildMetadata({
    title: course ? `${course.name} — Online Course` : 'Online Course',
    description: course ? courseSummary(course.content) : 'A self-paced online course on Hallos.',
    thumbnail: course?.imageUrl,
    path: coursePath(id),
    noIndex: true,
  });
}

// Course ids are UUIDs; anything else is a bad link (and would make the backend 500, not 404).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PublicCoursePage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { course, notFound: missing } = await fetchCourse(id);
  if (missing) notFound();
  // Backend down: throw so ISR keeps the last good copy instead of caching an error page.
  if (!course) throw new Error(`Course "${id}" could not be loaded`);

  // The course payload's department carries the raw (import-era) name; look it up for the clean one.
  const departments = await fetchDepartments();
  const department = departments.find((d) => d.id === course.departmentId) ?? null;
  const departmentName = department ? cleanDepartmentName(department.name) : null;

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/course' },
    ...(department && departmentName ? [{ name: `${departmentName} Courses`, path: departmentPath(department) }] : []),
    { name: course.name, path: coursePath(course.id) },
  ];
  const blocks = parseCourseContent(course.content);
  const modules = parseCurriculum(course.curriculum);
  const enrollHref = `/dashboard/courses/${course.id}`;

  return (
    <>
      <article className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1100px] mx-auto">
        <JsonLd data={breadcrumbSchema(crumbs)} />
        <Breadcrumbs items={crumbs} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <header className="flex flex-col sm:flex-row gap-5 mb-8">
              <div className="relative w-full sm:w-[220px] h-[180px] flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                {course.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- course images come from arbitrary hosts
                  <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
                ) : (
                  <GeneratedCourseThumbnail courseId={course.id} courseTitle={course.name} className="w-full h-full" showFirstLetter />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{course.name}</h1>
                <ul className="flex flex-wrap gap-2 text-sm text-text-secondary">
                  {course.duration && (
                    <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                      <Clock size={14} aria-hidden="true" /> {course.duration}
                    </li>
                  )}
                  <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                    <MonitorPlay size={14} aria-hidden="true" /> Self-paced online
                  </li>
                  <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                    <Award size={14} aria-hidden="true" /> Certificate on completion
                  </li>
                </ul>
                {department && departmentName && (
                  <p className="text-sm text-text-secondary">
                    Part of{' '}
                    <Link href={departmentPath(department)} className="text-accent-cyan hover:underline">
                      {departmentName} courses
                    </Link>
                  </p>
                )}
              </div>
            </header>

            <section aria-label="About this course" className="space-y-4 text-text-secondary leading-relaxed">
              {blocks.map((block, i) =>
                block.kind === 'heading' ? (
                  <h2 key={i} className="text-xl font-bold text-text-primary pt-4 first:pt-0">
                    {block.text}
                  </h2>
                ) : block.kind === 'list' ? (
                  <ul key={i} className="list-disc pl-6 space-y-1.5">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{block.text}</p>
                )
              )}
            </section>

            {modules.length > 0 && (
              <section aria-labelledby="curriculum" className="mt-10">
                <h2 id="curriculum" className="text-xl font-bold text-text-primary mb-4">
                  Curriculum
                </h2>
                <ol className="space-y-2.5">
                  {modules.map((module) => (
                    <li key={module} className="rounded-lg border border-border bg-white/[0.02] px-4 py-3 text-sm text-text-primary">
                      {module}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className="lg:w-[260px] flex-shrink-0">
            <div className="lg:sticky lg:top-28 rounded-xl border border-border bg-white/[0.03] p-5 flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Learn at your own pace, on any device, and earn a certificate when you finish.
              </p>
              <Link
                href={enrollHref}
                className={buttonClasses({ variant: 'primary', size: 'lg', className: 'flex items-center justify-center gap-2 w-full' })}
              >
                Enroll now <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <p className="text-xs text-text-secondary text-center">
                New to Hallos?{' '}
                <Link href={`/signup?redirect=${encodeURIComponent(enrollHref)}`} className="text-accent-cyan hover:underline">
                  Create a free account
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </article>
      <Footer />
    </>
  );
}
