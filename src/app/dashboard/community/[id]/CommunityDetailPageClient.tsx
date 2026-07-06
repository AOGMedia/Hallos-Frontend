/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Community, CommunityTab } from '@/types/community';
import { CommunityDetail } from '@/components/community/CommunityDetail';
import { useCommunity } from '@/hooks/useCommunityAPI';

interface CommunityDetailPageClientProps {
  community: Community;
  initialTab: CommunityTab;
}

export function CommunityDetailPageClient({ community, initialTab }: CommunityDetailPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CommunityTab>(initialTab);
  const [copied, setCopied] = useState(false);

  const { data: response, isLoading, error } = useCommunity(community.id);
  
  // Robustly determine the community data and membership status
  const liveCommunity = useMemo(() => {
    if (!response) return community;
    
    // Some APIs wrap in 'data', some return directly. 
    // We check both the root and the .data property.
    const baseData = (response.data && typeof response.data === 'object') ? response.data : response;
    
    // Aggressively hunt for the status and isMember flags
    const res = response as any;
    const mStatus = res.membershipStatus || baseData.membershipStatus || 
                   res.membership_status || baseData.membership_status ||
                   res.status || baseData.status;
                   
    const isMem = res.isMember ?? baseData.isMember ?? 
                  res.is_member ?? baseData.is_member;

    const jRequests = res.joinRequests || baseData.joinRequests || 
                     res.join_requests || baseData.join_requests ||
                     res.pendingRequests || baseData.pendingRequests ||
                     res.pending_requests || baseData.pending_requests;

    return {
      ...community, 
      ...baseData,
      membershipStatus: typeof mStatus === 'string' ? mStatus : undefined,
      isMember: typeof isMem === 'boolean' ? isMem : undefined,
      joinRequests: Array.isArray(jRequests) ? jRequests : (community.joinRequests || []),
    } as Community;
  }, [response, community]);

  if (isLoading && liveCommunity.name === 'Loading...') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-text-primary">Failed to load community</p>
        <p className="text-sm text-text-gray">{(error as Error).message || 'The community might not exist or you might not have access.'}</p>
        <button onClick={handleBack} className="text-primary hover:underline text-sm">
          ← Back to communities
        </button>
      </div>
    );
  }

  function handleBack() {
    router.push('/dashboard/community');
  }

  function handleTabChange(tab: CommunityTab) {
    setActiveTab(tab);
    // Use history API directly to avoid Next.js scroll-to-top on router.replace
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url.toString());
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available, silently ignore
    }
  }

  return (
    <>
      <CommunityDetail
        community={liveCommunity}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBack={handleBack}
        onShare={handleShare}
      />
      {copied && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-full shadow-lg z-50">
          Link copied!
        </div>
      )}
    </>
  );
}
