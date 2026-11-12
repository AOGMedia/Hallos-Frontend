import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';
import { fetchAllBlogPosts, fetchDepartments, fetchPublicSeries } from '@/lib/seo/publicApi';
import { departmentSlug } from '@/lib/courses/catalog';
import { DEPARTMENT_PAGE_SIZE, departmentPagePath } from '@/lib/courses/departmentPage';
import { seriesPath } from '@/lib/live/seriesUrl';

/** Rebuilt at most hourly so new posts and series show up without a deploy. */
export const revalidate = 3600;

/**
 * Public, indexable pages only — anything behind sign-in stays out, and so do
 * /signin and /signup (noindex: a bare form is nothing to rank).
 */
const STATIC_ROUTES: Array<{ path: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/course', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/classes', changeFrequency: 'daily', priority: 0.9 },
  { path: '/events', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, series, departments] = await Promise.all([fetchAllBlogPosts(), fetchPublicSeries(), fetchDepartments()]);

  // Department pages (every page of each) are the indexed face of the course
  // catalog; individual course pages are noindex (white-label text).
  const departmentEntries: MetadataRoute.Sitemap = departments
    .filter((d) => d.courseCount > 0)
    .flatMap((d) => {
      const pages = Math.ceil(d.courseCount / DEPARTMENT_PAGE_SIZE);
      return Array.from({ length: pages }, (_, i) => ({
        url: `${SITE.url}${departmentPagePath(departmentSlug(d.name), i + 1)}`,
        changeFrequency: 'weekly' as const,
        priority: i === 0 ? 0.7 : 0.4,
      }));
    });

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE.url}${r.path === '/' ? '' : r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
    ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
  }));

  const seriesEntries: MetadataRoute.Sitemap = series
    .filter((s) => s.privacy === undefined || s.privacy === 'public')
    .map((s) => ({
      url: `${SITE.url}${seriesPath(s)}`,
      lastModified: s.updatedAt ?? undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
      ...(s.thumbnailUrl ? { images: [s.thumbnailUrl] } : {}),
    }));

  return [...staticEntries, ...departmentEntries, ...postEntries, ...seriesEntries];
}
