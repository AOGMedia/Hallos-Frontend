import { buildMetadata } from '@/lib/metadata';
import VideoDetailsClient from './VideoDetailsClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchVideoMeta(id: string): Promise<{ title: string; description: string; thumbnail: string } | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/videos/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    if (!data) return null;
    return {
      title: data.title || 'Video',
      description: data.description || '',
      thumbnail: data.thumbnailUrl || data.thumbnail || '',
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const video = await fetchVideoMeta(id);
  return buildMetadata({
    title: video?.title || 'Watch Video',
    description: video?.description || 'Watch this video on Hallos',
    thumbnail: video?.thumbnail || '',
  });
}

export default function VideoDetailsPage() {
  return <VideoDetailsClient />;
}
