/**
 * Single source of truth for how Hallos describes itself to search engines and
 * social crawlers. Metadata, the sitemap, robots.txt, the manifest and JSON-LD
 * all read from here so the brand, URL and wording never drift apart.
 */

/** Canonical origin. www.hallos.net is the production host every share link already uses. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hallos.net').replace(/\/+$/, '');

export const SITE = {
  name: 'Hallos',
  legalName: 'Hallos Inc.',
  url: SITE_URL,
  title: 'Hallos — Learn Live from the Best Creators',
  tagline: 'Learn live from the best creators',
  description:
    'Hallos is the creator economy platform where you learn live from top creators. Join interactive live classes, take self-paced courses with certificates, and grow with communities.',
  keywords: [
    'Hallos',
    'live classes',
    'online courses',
    'online courses with certificates',
    'learn online',
    'creator economy',
    'live learning platform',
    'online learning Nigeria',
    'teach online',
    'creators',
    'communities',
  ],
  locale: 'en_NG',
  themeColor: '#0D0F18',
  supportEmail: 'support@hallos.net',
  logoPath: '/icon-512.png',
  ogImage: {
    path: '/og-default.jpg',
    width: 1200,
    height: 630,
    alt: 'Hallos — Learn live from the best creators',
  },
  /** Official profiles. These still use the earlier Learning247 handles; they are the same organisation. */
  sameAs: [
    'https://web.facebook.com/profile.php?id=61573028903471',
    'https://www.instagram.com/learning247live/',
    'https://www.tiktok.com/@learning247live',
    'https://x.com/Learning247Live',
    'https://www.linkedin.com/company/106357438/',
    'https://whatsapp.com/channel/0029VbAuQCzGpLHXVDV17t3u',
  ],
} as const;

/** Absolute URL for a site path or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Plain-text summary suitable for a meta description (strips markdown/HTML, trims to ~160 chars). */
export function toDescription(text: string | null | undefined, max = 160): string {
  if (!text) return '';
  const plain = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`;
}
