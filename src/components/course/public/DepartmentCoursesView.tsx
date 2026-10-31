import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/sections/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonLd';
import { departmentPagePath, type DepartmentPageData } from '@/lib/courses/departmentPage';
import { Breadcrumbs } from './Breadcrumbs';
import { DepartmentLinks } from './DepartmentLinks';
import { PublicCourseCard } from './PublicCourseCard';

/** Server-rendered department page: intro, course grid, pagination, links to other departments. */
export function DepartmentCoursesView({ data }: { data: DepartmentPageData }) {
  const { department, name, slug, intro, courses, page, totalPages, allDepartments } = data;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/course' },
    { name: `${name} Courses`, path: departmentPagePath(slug, 1) },
    ...(page > 1 ? [{ name: `Page ${page}`, path: departmentPagePath(slug, page) }] : []),
  ];

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1200px] mx-auto">
        <JsonLd data={breadcrumbSchema(crumbs)} />
        <Breadcrumbs items={crumbs} />

        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">{name} Courses</h1>
          <p className="text-text-secondary leading-relaxed">{intro}</p>
          <p className="mt-3 text-sm text-text-secondary">
            {department.courseCount} self-paced {department.courseCount === 1 ? 'course' : 'courses'}
            {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course, i) => (
            <PublicCourseCard key={course.id} course={course} eager={i < 4} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav aria-label={`${name} course pages`} className="flex items-center justify-center gap-3 mt-10">
            <PageLink href={page > 1 ? departmentPagePath(slug, page - 1) : null} label="Previous page">
              <ChevronLeft size={18} />
            </PageLink>
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <PageLink href={page < totalPages ? departmentPagePath(slug, page + 1) : null} label="Next page">
              <ChevronRight size={18} />
            </PageLink>
          </nav>
        )}

        <DepartmentLinks departments={allDepartments} currentId={department.id} title="Explore other departments" />
      </div>
      <Footer />
    </>
  );
}

const PAGE_LINK_CLASS =
  'p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors';

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} className={`${PAGE_LINK_CLASS} opacity-30 cursor-not-allowed`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={PAGE_LINK_CLASS}>
      {children}
    </Link>
  );
}
