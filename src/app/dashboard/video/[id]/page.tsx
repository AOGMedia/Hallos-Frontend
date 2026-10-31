import { buildMetadata } from '@/lib/metadata';
import VideoDetailsClient from './VideoDetailsClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generic on purpose. The only backend read for a single video
// (GET /videos/:id) records a view on every call and returns 402 for paid
// videos, so calling it from a server render would inflate view counts.
// Per-video titles/thumbnails need a side-effect-free metadata endpoint first.
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return buildMetadata({
    title: 'Watch video',
    description: 'Watch this video from a Hallos creator.',
    path: `/dashboard/video/${id}`,
    noIndex: true,
  });
}

export default function VideoDetailsPage() {
  return <VideoDetailsClient />;
}
