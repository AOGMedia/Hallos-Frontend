import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';
import { fetchAllBlogPosts, fetchDepartments, fetchPublicSeries } from '@/lib/seo/publicApi';
import { departmentPath } from '@/lib/courses/catalog';

/** Rebuilt at most hourly so new posts and series show up without a deploy. */
export const revalidate = 3600;

/** Public, indexable pages only — anything behind sign-in stays out. */
const STATIC_ROUTES: Array<{ path: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/course', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/classes', changeFrequency: 'daily', priority: 0.9 },
  { path: '/events', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
  { path: '/signup', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/investor-relations', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, series, departments] = await Promise.all([fetchAllBlogPosts(), fetchPublicSeries(), fetchDepartments()]);

  // Department pages are the indexed face of the course catalog; individual
  // course pages are noindex (white-label text), so they stay out of the sitemap.
  const departmentEntries: MetadataRoute.Sitemap = departments
    .filter((d) => d.courseCount > 0)
    .map((d) => ({
      url: `${SITE.url}${departmentPath(d)}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

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
      url: `${SITE.url}/series/${s.id}`,
      lastModified: s.updatedAt ?? undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
      ...(s.thumbnailUrl ? { images: [s.thumbnailUrl] } : {}),
    }));

  return [...staticEntries, ...departmentEntries, ...postEntries, ...seriesEntries];
}
