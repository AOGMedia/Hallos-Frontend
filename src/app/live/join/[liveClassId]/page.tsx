import { buildMetadata } from '@/lib/metadata';
import { getLiveClass } from '@/services/liveClassService';
import LiveJoinClient from './LiveJoinClient';

interface PageProps {
  params: Promise<{ liveClassId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { liveClassId } = await params;
  try {
    const liveClass = await getLiveClass(liveClassId);
    return buildMetadata({
      title: liveClass.title,
      description: liveClass.description ?? `Join ${liveClass.title} — a live class on Hallos`,
      thumbnail: liveClass.thumbnailUrl ?? '',
    });
  } catch {
    return buildMetadata({
      title: 'Live Class',
      description: 'Join a live class on Hallos',
      thumbnail: '',
    });
  }
}

export default function LiveJoinPage() {
  return <LiveJoinClient />;
}
