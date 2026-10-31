import { buildMetadata } from '@/lib/metadata';
import { fetchSeries } from '@/lib/seo/publicApi';
import { breadcrumbSchema, seriesCourseSchema } from '@/lib/seo/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';
import SeriesDetailClient from './SeriesDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// fetchSeries is cached (shared with generateMetadata), so this is one backend call per revalidate window.
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const path = `/series/${id}`;
  const series = await fetchSeries(id);
  if (!series) {
    // Not publicly readable (private, missing, or backend down): can't vouch for it, so don't index.
    return buildMetadata({ title: 'Live Series', description: 'Watch live series on Hallos', path, noIndex: true });
  }
  return buildMetadata({
    title: series.title,
    description: series.description || `Join ${series.title} — a live series on Hallos`,
    thumbnail: series.thumbnailUrl,
    path,
    // Private series must never surface in search, even if the link leaks.
    noIndex: series.privacy !== undefined && series.privacy !== 'public',
  });
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id } = await params;
  const path = `/series/${id}`;
  const series = await fetchSeries(id);
  const isPublic = series && (series.privacy === undefined || series.privacy === 'public');

  return (
    <>
      {isPublic && (
        <JsonLd
          data={[
            seriesCourseSchema(series, path),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: series.title, path },
            ]),
          ]}
        />
      )}
      <SeriesDetailClient />
    </>
  );
}
