import { notFound } from 'next/navigation';
import { DepartmentCoursesView } from '@/components/course/public/DepartmentCoursesView';
import { departmentPageMetadata, loadDepartmentPage } from '@/lib/courses/departmentPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ISR: rendered on first request, cached for an hour. Nothing is prebuilt so a
// backend blip during `next build` can't fail a deploy.
export const revalidate = 3600;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return departmentPageMetadata(await loadDepartmentPage(slug, 1), slug, 1);
}

export default async function DepartmentPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await loadDepartmentPage(slug, 1);
  if (result.status === 'not-found') notFound();
  // Backend down: throw so ISR keeps the last good copy (never cache a 404 for a real department).
  if (result.status === 'unavailable') throw new Error(`Department "${slug}" could not be loaded`);
  return <DepartmentCoursesView data={result.data} />;
}
