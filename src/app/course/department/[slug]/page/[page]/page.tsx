import { notFound, permanentRedirect } from 'next/navigation';
import { DepartmentCoursesView } from '@/components/course/public/DepartmentCoursesView';
import { departmentPageMetadata, departmentPagePath, loadDepartmentPage } from '@/lib/courses/departmentPage';

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams(): Promise<Array<{ slug: string; page: string }>> {
  return [];
}

function parsePage(raw: string): number {
  return /^\d+$/.test(raw) ? Number(raw) : NaN;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, page: raw } = await params;
  const page = parsePage(raw);
  return departmentPageMetadata(await loadDepartmentPage(slug, page), slug, page);
}

export default async function DepartmentPagedPage({ params }: PageProps) {
  const { slug, page: raw } = await params;
  const page = parsePage(raw);
  // /page/1 duplicates the department's main URL.
  if (page === 1) permanentRedirect(departmentPagePath(slug, 1));

  const result = await loadDepartmentPage(slug, page);
  if (result.status === 'not-found') notFound();
  if (result.status === 'unavailable') throw new Error(`Department "${slug}" page ${raw} could not be loaded`);
  return <DepartmentCoursesView data={result.data} />;
}
