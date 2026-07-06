import { buildMetadata } from '@/lib/metadata';
import { getSeriesDetails } from '@/services/seriesService';
import SeriesDetailClient from './SeriesDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const series = await getSeriesDetails(id);
    return buildMetadata({
      title: series.title,
      description: series.description ?? `Watch ${series.title} — a live series on Hallos`,
      thumbnail: series.thumbnailUrl ?? '',
    });
  } catch {
    return buildMetadata({
      title: 'Live Series',
      description: 'Watch live series on Hallos',
      thumbnail: '',
    });
  }
}

export default function SeriesDetailPage() {
  return <SeriesDetailClient />;
}
