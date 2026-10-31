import Link from 'next/link';
import { cleanDepartmentName, departmentPath } from '@/lib/courses/catalog';
import type { PublicDepartment } from '@/lib/seo/publicApi';

/**
 * Crawlable links to every department page. Used on /course (whose catalog
 * is client-rendered) and at the foot of each department page, so search
 * engines can reach the whole catalog by following plain links.
 */
export function DepartmentLinks({
  departments,
  currentId,
  title = 'Browse courses by department',
}: {
  departments: PublicDepartment[];
  currentId?: string;
  title?: string;
}) {
  const visible = departments
    .filter((d) => d.courseCount > 0 && d.id !== currentId)
    .sort((a, b) => cleanDepartmentName(a.name).localeCompare(cleanDepartmentName(b.name)));
  if (visible.length === 0) return null;

  return (
    <nav aria-label={title} className="mt-10">
      <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4">{title}</h2>
      <ul className="flex flex-wrap gap-2.5">
        {visible.map((d) => (
          <li key={d.id}>
            <Link
              href={departmentPath(d)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-4 py-2 text-sm text-text-primary hover:border-accent-cyan/50 hover:text-accent-cyan transition-colors"
            >
              {cleanDepartmentName(d.name)}
              <span className="text-xs text-text-secondary">{d.courseCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
