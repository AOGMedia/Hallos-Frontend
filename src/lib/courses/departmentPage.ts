import { buildMetadata } from '@/lib/metadata';
import { fetchDepartmentCourses, fetchDepartments, type PublicCourse, type PublicDepartment } from '@/lib/seo/publicApi';
import { departmentIntro } from '@/data/departmentIntros';
import { cleanDepartmentName, departmentPath, departmentSlug, findDepartmentBySlug } from './catalog';

/**
 * Data + metadata for the public department pages:
 *   /course/department/[slug]             (page 1)
 *   /course/department/[slug]/page/[n]    (page 2+)
 * Pagination lives in the path, not ?page=, so every page can be cached
 * (ISR) and an unknown department or page is a real 404.
 */

export const DEPARTMENT_PAGE_SIZE = 48;

export interface DepartmentPageData {
  department: PublicDepartment;
  name: string;
  slug: string;
  intro: string;
  courses: PublicCourse[];
  page: number;
  totalPages: number;
  allDepartments: PublicDepartment[];
}

export function departmentPagePath(slug: string, page: number) {
  return page <= 1 ? `/course/department/${slug}` : `/course/department/${slug}/page/${page}`;
}

export type DepartmentPageResult =
  | { status: 'ok'; data: DepartmentPageData }
  | { status: 'not-found' }
  | { status: 'unavailable' };

export async function loadDepartmentPage(slug: string, page: number): Promise<DepartmentPageResult> {
  const departments = await fetchDepartments();
  if (departments.length === 0) return { status: 'unavailable' };

  const department = findDepartmentBySlug(departments, slug);
  if (!department || department.courseCount === 0) return { status: 'not-found' };

  const totalPages = Math.max(1, Math.ceil(department.courseCount / DEPARTMENT_PAGE_SIZE));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return { status: 'not-found' };

  const courses = await fetchDepartmentCourses(department.id, {
    limit: DEPARTMENT_PAGE_SIZE,
    offset: (page - 1) * DEPARTMENT_PAGE_SIZE,
  });
  if (!courses) return { status: 'unavailable' };
  // courseCount can include inactive courses, so a trailing page may come back empty.
  if (courses.length === 0) return { status: 'not-found' };

  const name = cleanDepartmentName(department.name);
  return {
    status: 'ok',
    data: {
      department,
      name,
      slug: departmentSlug(department.name),
      intro: departmentIntro(departmentSlug(department.name), name, department.courseCount),
      courses,
      page,
      totalPages,
      allDepartments: departments,
    },
  };
}

export function departmentPageMetadata(result: DepartmentPageResult, slug: string, page: number) {
  const path = departmentPagePath(slug, page);
  if (result.status !== 'ok') {
    return buildMetadata({ title: 'Courses', description: 'Self-paced online courses on Hallos.', path, noIndex: true });
  }
  const { name, intro, department } = result.data;
  return buildMetadata({
    title: page > 1 ? `${name} Courses Online — Page ${page}` : `${name} Courses Online`,
    description: page > 1 ? `Page ${page} of ${department.courseCount} self-paced ${name} courses. ${intro}` : intro,
    path: page > 1 ? path : departmentPath(department),
  });
}
