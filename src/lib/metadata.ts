import type { Metadata } from 'next';

interface MetadataContent {
  title: string;
  description: string;
  thumbnail: string;
  /** Optional URL override — defaults to the current page URL if omitted */
  url?: string;
}

/**
 * Builds reusable Next.js Metadata for any shareable content page.
 * Use for: community pages, live classes, live series, video pages, etc.
 *
 * @example
 * // app/dashboard/community/[id]/page.tsx
 * export async function generateMetadata({ params }) {
 *   const community = getCommunityById(params.id);
 *   return buildMetadata({
 *     title: community.name,
 *     description: community.description,
 *     thumbnail: community.thumbnail,
 *   });
 * }
 */
export function buildMetadata({ title, description, thumbnail, url }: MetadataContent): Metadata {
  // Ensure thumbnail is an absolute URL — WhatsApp/social crawlers can't follow relative paths
  const absoluteThumbnail = thumbnail && thumbnail.startsWith('http')
    ? thumbnail
    : thumbnail
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://hallos.app'}${thumbnail}`
      : '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(url ? { url } : {}),
      images: absoluteThumbnail ? [
        {
          url: absoluteThumbnail,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: absoluteThumbnail ? [absoluteThumbnail] : [],
    },
  };
}
