import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';

/**
 * Only blocks paths that are never shared publicly. Shareable-but-private
 * pages (dashboard videos/communities, live class links) are NOT blocked here:
 * link-preview bots such as Twitterbot obey robots.txt, so blocking them would
 * kill share cards. Those pages carry a `noindex` robots meta instead.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/auth/',
          '/payments/',
          '/series/manage/',
          '/live/room/',
          '/live/host-zego/',
          '/dashboard/room/',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
