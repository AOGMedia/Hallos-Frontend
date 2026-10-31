import type { BlogPost } from '@/services/blogService';
import type { PublicSeries } from './publicApi';
import { SITE, absoluteUrl, toDescription } from './site';

/**
 * schema.org builders. Google reads these for rich results (sitelinks search
 * box, FAQ, events, articles, courses) and to understand Hallos as one entity.
 * Keep every value truthful to what the page shows — mismatches cost trust.
 */

type Schema = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function organizationSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: absoluteUrl(SITE.logoPath),
    description: SITE.description,
    email: SITE.supportEmail,
    sameAs: SITE.sameAs,
  };
}

export function websiteSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

export function faqSchema(faqs: ReadonlyArray<{ question: string; answer: string }>): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: ReadonlyArray<{ name: string; path: string }>): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingSchema(post: BlogPost, path: string): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: toDescription(post.excerpt || post.body),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
    url: absoluteUrl(path),
    image: [post.coverImageUrl ? absoluteUrl(post.coverImageUrl) : absoluteUrl(SITE.ogImage.path)],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
    author: post.authorName
      ? { '@type': 'Person', name: post.authorName }
      : { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@id': ORG_ID, '@type': 'Organization', name: SITE.name, logo: absoluteUrl(SITE.logoPath) },
    inLanguage: 'en',
  };
}

export function blogListSchema(posts: ReadonlyArray<BlogPost>): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE.name} Blog`,
    url: absoluteUrl('/blog'),
    publisher: { '@id': ORG_ID },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.publishedAt ?? p.createdAt,
    })),
  };
}

/** A live series is a multi-session online course taught live by a creator. */
export function seriesCourseSchema(series: PublicSeries, path: string): Schema {
  const creatorName = [series.creator?.firstname, series.creator?.lastname].filter(Boolean).join(' ');
  const price = Number(series.price ?? 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: series.title,
    description: toDescription(series.description) || `${series.title} — a live series on ${SITE.name}`,
    url: absoluteUrl(path),
    ...(series.thumbnailUrl ? { image: absoluteUrl(series.thumbnailUrl) } : {}),
    provider: { '@id': ORG_ID, '@type': 'Organization', name: SITE.name, url: SITE.url },
    ...(series.category ? { about: series.category } : {}),
    offers: {
      '@type': 'Offer',
      category: price > 0 ? 'Paid' : 'Free',
      price: Number.isFinite(price) ? price : 0,
      priceCurrency: series.currency || 'NGN',
      url: absoluteUrl(path),
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      ...(series.startDate ? { startDate: series.startDate } : {}),
      ...(series.endDate ? { endDate: series.endDate } : {}),
      ...(creatorName ? { instructor: { '@type': 'Person', name: creatorName } } : {}),
    },
  };
}

export function eventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  path: string;
  image: string;
  locationName: string;
  locality: string;
  country: string;
}): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: absoluteUrl(event.path),
    image: [absoluteUrl(event.image)],
    location: {
      '@type': 'Place',
      name: event.locationName,
      address: { '@type': 'PostalAddress', addressLocality: event.locality, addressCountry: event.country },
    },
    organizer: { '@id': ORG_ID, '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
}
