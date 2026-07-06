import { resolveTab } from '@/lib/community';
import { buildMetadata } from '@/lib/metadata';
import type { Community } from '@/types/community';
import { CommunityDetailPageClient } from './CommunityDetailPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

async function fetchCommunityForMeta(id: string): Promise<{ name: string; description: string; thumbnail: string } | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/communities/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data) return null;
    return {
      name: data.name || 'Community',
      description: data.description || '',
      thumbnail: data.thumbnailUrl || data.thumbnail || data.posterUrl || '',
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const community = await fetchCommunityForMeta(id);
  return buildMetadata({
    title: community?.name || 'Community',
    description: community?.description || 'Join this community on Hallos',
    thumbnail: community?.thumbnail || '',
  });
}

export default async function CommunityDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  // Try to get real community data server-side for initial render
  // Falls back to a minimal shell — client will hydrate with full data via useCommunity hook
  const communityMeta = await fetchCommunityForMeta(id);
  const community: Community = communityMeta
    ? {
        id,
        name: communityMeta.name,
        description: communityMeta.description,
        thumbnail: communityMeta.thumbnail || '/placeholder-community.jpg',
        thumbnailUrl: communityMeta.thumbnail || '/placeholder-community.jpg',
        memberCount: '0',
        eventCount: 0,
        memberAvatars: [],
        role: 'guest',
        announcements: [],
        members: [],
        joinRequests: [],
      }
    : {
        id,
        name: 'Loading...',
        description: '',
        thumbnail: '/placeholder-community.jpg',
        thumbnailUrl: '/placeholder-community.jpg',
        memberCount: '0',
        eventCount: 0,
        memberAvatars: [],
        role: 'guest',
        announcements: [],
        members: [],
        joinRequests: [],
      } as Community;

  const initialTab = resolveTab(tab);
  return <CommunityDetailPageClient community={community} initialTab={initialTab} />;
}
