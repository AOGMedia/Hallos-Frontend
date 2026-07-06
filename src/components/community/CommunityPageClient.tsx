'use client';

import dynamic from 'next/dynamic';

const CommunityPage = dynamic(() => import('./CommunityPage'), { ssr: false });

export function CommunityPageClient() {
  return <CommunityPage />;
}
