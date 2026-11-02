import { buildMetadata } from '@/lib/metadata';
import { fetchSeries } from '@/lib/seo/publicApi';
import { breadcrumbSchema, seriesCourseSchema } from '@/lib/seo/jsonLd';
import { seriesIdFromParam, seriesPath } from '@/lib/live/seriesUrl';
import { JsonLd } from '@/components/seo/JsonLd';
import SeriesDetailClient from './SeriesDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// The route param is "<uuid>" (old links, payment callbacks) or "<title-slug>-<uuid>"
// (canonical). Both serve the page; the canonical tag points at the slug form.

// fetchSeries is cached (shared with generateMetadata), so this is one backend call per revalidate window.
export async function generateMetadata({ params }: PageProps) {
  const { id: param } = await params;
  const id = seriesIdFromParam(param);
  const series = await fetchSeries(id);
  if (!series) {
    // Not publicly readable (private, missing, or backend down): can't vouch for it, so don't index.
    return buildMetadata({ title: 'Live Series', description: 'Watch live series on Hallos', path: `/series/${id}`, noIndex: true });
  }
  return buildMetadata({
    title: series.title,
    description: series.description || `Join ${series.title} — a live series on Hallos`,
    thumbnail: series.thumbnailUrl,
    path: seriesPath(series),
    // Private series must never surface in search, even if the link leaks.
    noIndex: series.privacy !== undefined && series.privacy !== 'public',
  });
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id: param } = await params;
  const series = await fetchSeries(seriesIdFromParam(param));
  const isPublic = !!series && (series.privacy === undefined || series.privacy === 'public');
  const path = series ? seriesPath(series) : '';

  return (
    <>
      {isPublic && (
        <JsonLd
          data={[
            seriesCourseSchema(series, path),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Live classes', path: '/classes' },
              { name: series.title, path },
            ]),
          ]}
        />
      )}
      {/* Public data lets the page render (and be crawled) before the signed-in query resolves. */}
      <SeriesDetailClient initialSeries={isPublic ? series : null} />
    </>
  );
}
