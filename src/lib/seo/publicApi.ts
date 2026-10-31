import type { BlogPost } from '@/services/blogService';
import { isLegacyLiveClass } from '@/lib/live/providers';

/**
 * Server-only module. Server-side reads of PUBLIC backend endpoints, for server-rendered pages,
 * metadata and the sitemap. Uses fetch (not the axios apiClient) so Next can
 * cache responses, and never sends a token — these endpoints need none, and a
 * server render must never depend on a visitor's session.
 *
 * Every helper fails soft (returns null / []) so a slow or down backend
 * degrades a page instead of crashing it.
 */

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

/** Seconds a public response may be reused before Next refetches it in the background. */
const REVALIDATE_SECONDS = 300;
const TIMEOUT_MS = 8000;

async function getJson<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<{ status: number; data: T | null }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { status: res.status, data: null };
    return { status: res.status, data: (await res.json()) as T };
  } catch {
    return { status: 0, data: null };
  }
}

// ── Blog ────────────────────────────────────────────────────────────────────

export interface PublicBlogPage {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export const BLOG_PAGE_SIZE = 12;

export async function fetchBlogPage(page: number): Promise<PublicBlogPage | null> {
  const { data } = await getJson<PublicBlogPage & { success: boolean }>(
    `/api/blog/posts?page=${page}&limit=${BLOG_PAGE_SIZE}`
  );
  if (!data?.success) return null;
  return { posts: data.posts, page: data.page, totalPages: data.totalPages, totalCount: data.totalCount };
}

/** `notFound: true` only when the backend positively says 404, so an outage never de-indexes a post. */
export async function fetchBlogPost(slug: string): Promise<{ post: BlogPost | null; notFound: boolean }> {
  const { status, data } = await getJson<{ success: boolean; post: BlogPost }>(
    `/api/blog/posts/${encodeURIComponent(slug)}`
  );
  return { post: data?.success ? data.post : null, notFound: status === 404 };
}

/** Every published post (for the sitemap), walking pages until done. */
export async function fetchAllBlogPosts(): Promise<BlogPost[]> {
  const all: BlogPost[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data } = await getJson<PublicBlogPage & { success: boolean }>(
      `/api/blog/posts?page=${page}&limit=50`,
      3600
    );
    if (!data?.success) break;
    all.push(...data.posts);
    if (page >= data.totalPages) break;
  }
  return all;
}

// ── Live series ─────────────────────────────────────────────────────────────

export interface PublicSeries {
  id: string;
  title: string;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  privacy?: string;
  updatedAt?: string;
  creator?: { id: number; firstname?: string | null; lastname?: string | null } | null;
}

/** Active, public series (the backend's default filter for this endpoint). */
export async function fetchPublicSeries(): Promise<PublicSeries[]> {
  const { data } = await getJson<{ success: boolean; series: PublicSeries[] }>('/api/live/series', 3600);
  return data?.success ? data.series : [];
}

export async function fetchSeries(id: string): Promise<PublicSeries | null> {
  const { data } = await getJson<{ success: boolean; series: PublicSeries }>(
    `/api/live/series/${encodeURIComponent(id)}`
  );
  return data?.success ? data.series : null;
}

// ── Live classes ────────────────────────────────────────────────────────────

/**
 * The fields a public page may show. The backend also returns streaming
 * details (e.g. room ids) for free classes; those are deliberately left out
 * so they are never serialised into page HTML.
 */
export interface PublicLiveClass {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  thumbnailUrl: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string | null;
  privacy: string | null;
  instructorName: string | null;
  instructorAvatarUrl: string | null;
  /** Created with the retired Mux/OBS streaming; can no longer be joined. */
  isLegacy: boolean;
}

type RawLiveClass = {
  streaming_provider?: string | null;
  streamingProvider?: string | null;
  id: string;
  title?: string;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  startTime?: string | null;
  start_time?: string | null;
  endTime?: string | null;
  end_time?: string | null;
  status?: string | null;
  privacy?: string | null;
  recording_asset_id?: string | null;
  // Detail endpoint shape
  instructor?: { name?: string | null; firstname?: string | null; lastname?: string | null; avatarUrl?: string | null } | null;
  // List endpoint shape (/live/getLive)
  hosts?: Array<{ User?: { firstname?: string | null; lastname?: string | null; avatarUrl?: string | null } | null }>;
  creatorName?: string | null;
  creatorAvatarUrl?: string | null;
};

function fullName(p?: { firstname?: string | null; lastname?: string | null } | null): string {
  return `${p?.firstname ?? ''} ${p?.lastname ?? ''}`.trim();
}

function toPublicLiveClass(raw: RawLiveClass): PublicLiveClass {
  const price = Number(raw.price ?? 0);
  const hostUser = raw.hosts?.[0]?.User ?? null;
  // Mirrors listLiveClassesExternal: a class with a recording is over.
  const status = raw.recording_asset_id && raw.status !== 'live' ? 'recorded' : raw.status ?? null;
  return {
    id: raw.id,
    title: raw.title || 'Live class',
    description: raw.description ?? null,
    price: Number.isFinite(price) ? price : 0,
    currency: raw.currency || 'NGN',
    category: raw.category ?? null,
    thumbnailUrl: raw.thumbnailUrl ?? raw.thumbnail_url ?? null,
    startTime: raw.startTime ?? raw.start_time ?? null,
    endTime: raw.endTime ?? raw.end_time ?? null,
    status,
    privacy: raw.privacy ?? null,
    instructorName: raw.instructor?.name || fullName(raw.instructor) || fullName(hostUser) || raw.creatorName || null,
    instructorAvatarUrl: raw.instructor?.avatarUrl || hostUser?.avatarUrl || raw.creatorAvatarUrl || null,
    isLegacy: isLegacyLiveClass(raw),
  };
}

/** Upcoming/ongoing public live classes (the same feed the homepage uses). */
export async function fetchPublicLiveClasses(): Promise<PublicLiveClass[]> {
  const { data } = await getJson<{ liveClasses?: RawLiveClass[]; classes?: RawLiveClass[] }>('/live/getLive');
  const raw = data?.liveClasses ?? data?.classes ?? [];
  return raw
    .map(toPublicLiveClass)
    .filter((c) => c.privacy !== 'private' && c.status !== 'ended' && c.status !== 'recorded' && !c.isLegacy);
}

/** `notFound: true` only on a confirmed 404, so an outage never reads as "class deleted". */
export async function fetchLiveClass(id: string): Promise<{ liveClass: PublicLiveClass | null; notFound: boolean }> {
  const { status, data } = await getJson<RawLiveClass & { success?: boolean }>(`/live/${encodeURIComponent(id)}`, 60);
  return { liveClass: data?.id ? toPublicLiveClass(data) : null, notFound: status === 404 };
}

// ── Self-paced courses ──────────────────────────────────────────────────────

export interface PublicDepartment {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
}

/**
 * Course fields safe to render publicly. The API also returns `link` (the
 * provider's course URL); it is intentionally not part of this type, so it
 * can't end up on a page.
 */
export interface PublicCourse {
  id: string;
  name: string;
  content: string;
  curriculum: string;
  duration: string;
  imageUrl: string | null;
  departmentId: string | null;
  departmentName: string | null;
  departmentSlug: string | null;
  updatedAt: string | null;
}

type RawCourse = {
  id: string;
  name?: string;
  content?: string | null;
  curriculum?: string | null;
  duration?: string | null;
  imageUrl?: string | null;
  departmentId?: string | null;
  department?: { id?: string; name?: string; slug?: string } | null;
  updatedAt?: string | null;
};

function toPublicCourse(raw: RawCourse): PublicCourse {
  return {
    id: raw.id,
    name: raw.name || 'Course',
    content: raw.content || '',
    curriculum: raw.curriculum || '',
    duration: raw.duration || '',
    imageUrl: raw.imageUrl && raw.imageUrl.trim() ? raw.imageUrl : null,
    departmentId: raw.department?.id ?? raw.departmentId ?? null,
    departmentName: raw.department?.name ?? null,
    departmentSlug: raw.department?.slug ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export async function fetchDepartments(): Promise<PublicDepartment[]> {
  const { data } = await getJson<{ success: boolean; departments: PublicDepartment[] }>(
    '/api/courses/departments',
    3600
  );
  if (!data?.success) return [];
  return data.departments.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    courseCount: Number(d.courseCount) || 0,
  }));
}

export async function fetchDepartmentCourses(
  departmentId: string,
  { limit, offset }: { limit: number; offset: number }
): Promise<PublicCourse[] | null> {
  const { data } = await getJson<{ success: boolean; courses: RawCourse[] }>(
    `/api/courses/departments/${encodeURIComponent(departmentId)}/courses?limit=${limit}&offset=${offset}`,
    3600
  );
  return data?.success ? data.courses.map(toPublicCourse) : null;
}

export async function fetchCourse(id: string): Promise<{ course: PublicCourse | null; notFound: boolean }> {
  const { status, data } = await getJson<{ success: boolean; course: RawCourse }>(
    `/api/courses/${encodeURIComponent(id)}`,
    3600
  );
  return { course: data?.success ? toPublicCourse(data.course) : null, notFound: status === 404 };
}
