import type { Metadata } from 'next';
import { SITE, absoluteUrl, toDescription } from '@/lib/seo/site';

/**
 * For signed-in or transactional areas (dashboard, admin, checkout, auth).
 * `follow: true` still lets crawlers pass through links they find there.
 */
export const NO_INDEX: Metadata['robots'] = { index: false, follow: true };

/**
 * Title for a section layout. A layout with a plain string title stops the
 * root "%s | Hallos" template from reaching its child pages, so sections
 * re-declare the template alongside their own default.
 */
export function sectionTitle(name: string): Metadata['title'] {
  // `default` still receives the parent template, so it carries no suffix itself.
  return { default: name, template: `%s | ${SITE.name}` };
}

interface MetadataContent {
  title: string;
  description: string;
  /** Share image. Relative paths are made absolute; empty falls back to the default Hallos card. */
  thumbnail?: string | null;
  /** Canonical path for this page, e.g. `/blog/my-post`. Sets the canonical link and og:url. */
  path?: string;
  /** @deprecated use `path` — kept so older callers keep compiling. */
  url?: string;
  type?: 'website' | 'article';
  /** Article dates (ISO) — only used when `type` is 'article'. */
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  /** Keep the page out of search results while still allowing link previews. */
  noIndex?: boolean;
}

/**
 * Builds Next.js Metadata for any page: title, description, canonical URL,
 * Open Graph and Twitter cards. Titles get the root "| Hallos" template.
 *
 * Note: Next merges `openGraph` shallowly, so this always returns the full
 * object (site name, locale, image) rather than relying on the root layout.
 *
 * @example
 * export async function generateMetadata({ params }) {
 *   const { id } = await params;
 *   const series = await fetchSeries(id);
 *   return buildMetadata({ title: series.title, description: series.description, thumbnail: series.thumbnailUrl, path: `/series/${id}` });
 * }
 */
export function buildMetadata({
  title,
  description,
  thumbnail,
  path,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: MetadataContent): Metadata {
  const desc = toDescription(description) || SITE.description;
  const pageUrl = path ? absoluteUrl(path) : url;
  const image = thumbnail
    ? { url: absoluteUrl(thumbnail), alt: title }
    : { url: absoluteUrl(SITE.ogImage.path), width: SITE.ogImage.width, height: SITE.ogImage.height, alt: SITE.ogImage.alt };

  return {
    title,
    description: desc,
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(noIndex ? { robots: NO_INDEX } : {}),
    openGraph: {
      title,
      description: desc,
      siteName: SITE.name,
      locale: SITE.locale,
      ...(pageUrl ? { url: pageUrl } : {}),
      images: [image],
      ...(type === 'article'
        ? {
            type: 'article',
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
            ...(authors?.length ? { authors } : {}),
          }
        : { type: 'website' }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [image.url],
    },
  };
}
