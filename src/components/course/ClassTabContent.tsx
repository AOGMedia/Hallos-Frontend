'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listLiveClassesExternal, getPlaybackUrl, type LiveClass } from '@/services/liveClassService';
import { getMyPurchases } from '@/lib/api/payments';
import { transformPurchaseToCardProps, groupPurchasesByType, PurchaseDisplayItem } from '@/utils/purchaseTransformers';
import { CourseCard } from './CourseCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import CategoriesIcon from '@/components/icons/CategoriesIcon';
import TrendingIcon from '@/components/icons/TrendingIcon';
import VideoIcon from '@/components/icons/VideoIcon';
import SparkleIcon from '@/components/icons/SparkleIcon';
import { CodeXml, FlaskConical, GraduationCap } from 'lucide-react';
import { SpecialCoursesSection } from '@/components/dashboard/SpecialCoursesSection';
import InvitePage from '@/app/dashboard/invite/page';

interface ClassTabContentProps {
  activeTab: string;
}

export function ClassTabContent({ activeTab }: ClassTabContentProps) {
  const { userId } = useCurrentUser();


  const { data: liveClassesData, isLoading: isLiveClassesLoading, error: liveClassesError } = useQuery({
    queryKey: ['dashboard-live-classes-external'],
    queryFn: listLiveClassesExternal,
    enabled: activeTab === 'explore',
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });

  const classes = useMemo(() => liveClassesData || [], [liveClassesData]);
  const [, setPlaybacks] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (activeTab !== 'explore') return;
    
    let mounted = true;
    const fetchMissing = async () => {
      const idsToFetch = classes
        .filter((c) => !c.mux_playback_id && !c.playback_url)
        .map((c) => c.id);

      if (!idsToFetch.length) return;

      const updates: Record<string, string | null> = {};
      for (const id of idsToFetch) {
        try {
          const pb = await getPlaybackUrl(id);
          updates[id] = pb.playbackUrl;
        } catch {
          updates[id] = null;
        }
      }

      if (mounted) {
        setPlaybacks((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchMissing();
    return () => {
      mounted = false;
    };
  }, [classes, activeTab]);

  // Group classes by category
  const groupedClasses = useMemo(() => {
    const groups: Record<string, LiveClass[]> = {};
    
    classes.forEach(c => {
      // Logic for determining category:
     
      // 2. Fallback to 'General' (or you could use 'Uncategorized')
      const category = c.category || 'General';
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(c);
    });
    
    return groups;
  }, [classes]);

  
  // Purchases Tab Logic
  
  const [purchases, setPurchases] = useState<PurchaseDisplayItem[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoadingPurchases(true);
      setPurchasesError(null);
      const response = await getMyPurchases();
      if (response.success) {
        const transformedPurchases = response.purchases.map(transformPurchaseToCardProps);
        setPurchases(transformedPurchases);
      } else {
        setPurchasesError('Failed to load purchases');
      }
    } catch (err) {
      setPurchasesError('An error occurred while loading your purchases');
      console.error('Error fetching purchases:', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchases();
    }
  }, [activeTab]);

  const groupedPurchases = useMemo(() => groupPurchasesByType(purchases), [purchases]);

  
  // Helper: Get HREF for Live Class
  
  const getLiveClassHref = (c: LiveClass) => {
    const isOwner = String(c.userId) === String(userId);
    const isMuxClass = Boolean(c.mux_playback_id || c.playback_url);
    const isZegoClass = Boolean(c.isZegoCloud && !isMuxClass);

    // ZEGO (Interactive)
    if (isZegoClass) {
      if (isOwner) {
        return `/live/${c.id}/room`;
      }
      return `/live/join/${c.id}`;
    }

    // MUX / RTMP
    if (isOwner) {
      return `/live/creator/${c.id}`;
    }
    
    // Default Viewer
    return `/live/${c.id}`;
  };

  
  // Renderers
  
  
  if (activeTab === 'explore') {
    if (isLiveClassesLoading) {
      return (
        <div className="flex items-center justify-center py-12">
           <div className="text-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
             <p className="text-text-muted">Loading classes...</p>
           </div>
        </div>
      );
    }

    if (liveClassesError) {
      return (
        <div className="text-center py-12 text-red-400">
          Failed to load live classes{liveClassesError.message}
        </div>
      );
    }

    const formatDuration = (startTime?: string, endTime?: string) => {
      if (!startTime || !endTime) return 'TBA';
      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins <= 0) return 'TBA';
        
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours > 0) {
          return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
        }
        return `${mins} mins`;
      } catch {
        return 'TBA';
      }
    };

    const renderHorizontalList = (list: LiveClass[]) => (
      <div className="flex items-stretch overflow-x-auto gap-6 pb-4 scrollbar-hide -mx-4 px-4">
        {list.map((c) => {
          const href = getLiveClassHref(c);
          
          // Check if class is live now (backend status or time-based check)
          const isLiveNow = c.status === 'live' || (
            c.status === 'scheduled' && 
            c.startTime && 
            c.endTime && 
            (() => {
              const now = new Date();
              const start = new Date(c.startTime);
              const end = new Date(c.endTime);
              return now >= start && now <= end;
            })()
          );
          
          // Only pass scheduledFor if status is 'scheduled' and not currently live
          const scheduledFor = (c.status === 'scheduled' && !isLiveNow && c.startTime) ? c.startTime : undefined;
          
          return (
            <div key={c.id} className="flex-shrink-0 w-[300px] md:w-[350px]">
              <CourseCard
                id={c.id}
                title={c.title}
                description={c.description || ''}
                instructor={c.creatorName || 'Unknown Instructor'}
                thumbnail={c.thumbnailUrl || '/images/video-placeholder.svg'} 
                avatar={'/avatars/alex-chapman.jpg'}
                price={typeof c.price === 'number' ? c.price : Number(c.price) || 0}
                duration={formatDuration(c.startTime, c.endTime)}
                posted={c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                rating={0}
                reviews={'0'}
                isLive={Boolean(isLiveNow)}
                scheduledFor={scheduledFor}
                isPurchased={false}
                href={href}
              />
            </div>
          );
        })}
      </div>
    );

    const getCategoryIcon = (category: string) => {
      const lowerCat = category.toLowerCase();
      const props = { width: 20, height: 20, className: "text-white" };
      
      if (lowerCat.includes('tech') || lowerCat.includes('coding') || lowerCat.includes('development')) {
        return <VideoIcon {...props} />;
      }
      if (lowerCat.includes('science') || lowerCat.includes('coding') || lowerCat.includes('development')) {
        return <FlaskConical {...props} />;
      }
      if (lowerCat.includes('health') || lowerCat.includes('fitness') || lowerCat.includes('life')) {
        return <SparkleIcon {...props} />;
      }
      if (lowerCat.includes('programming') || lowerCat.includes('coding') || lowerCat.includes('web development')) {
        return <CodeXml {...props} />;
      }
      if (lowerCat.includes('education') || lowerCat.includes('learn') || lowerCat.includes('school')) {
        return <GraduationCap {...props} />;
      }
      if (lowerCat.includes('entertainment') || lowerCat.includes('fun') || lowerCat.includes('music')) {
        return <TrendingIcon {...props} />;
      }
      
      return <CategoriesIcon {...props} />;
    };

    return (
      <div className="space-y-10">
        <SpecialCoursesSection />
        {Object.entries(groupedClasses).map(([category, categoryClasses]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              {getCategoryIcon(category)}
              <div className="text-text-primary/90 font-semibold capitalize ml-2">
                {category} <span className="text-primary text-xs font-normal">({categoryClasses.length})</span>
              </div>
            </div>
            {renderHorizontalList(categoryClasses)}
          </div>
        ))}
        {Object.keys(groupedClasses).length === 0 && (
          <div className="text-text-primary/70">No live classes yet,ensure you are logged in  and network connectivity is stable.</div>
        )}
      </div>
    );
  }

  if (activeTab === 'purchases') {
    if (loadingPurchases) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading your purchases...</p>
          </div>
        </div>
      );
    }

    if (purchasesError) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">{purchasesError}</p>
            <button
              onClick={fetchPurchases}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (purchases.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-text-muted mb-4">You haven&apos;t made any purchases yet.</p>
            <p className="text-text-muted/70 text-sm">
              Explore our classes to find content you&apos;d like to purchase.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {groupedPurchases.videos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Video Courses ({groupedPurchases.videos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedPurchases.videos.map((purchase) => (
                <CourseCard
                  key={purchase.id}
                  {...purchase}
                />
              ))}
            </div>
          </div>
        )}

        {groupedPurchases.series.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Live Series ({groupedPurchases.series.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedPurchases.series.map((purchase) => (
                <CourseCard
                  key={purchase.id}
                  {...purchase}
                />
              ))}
            </div>
          </div>
        )}

        {groupedPurchases.live.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Live Sessions ({groupedPurchases.live.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedPurchases.live.map((purchase) => (
                <CourseCard
                  key={purchase.id}
                  {...purchase}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Invites tab
  if (activeTab === 'invites') {
    return <InvitePage />;
  }

  // Placeholder for other tabs
  return (
    <div className="text-text-primary/70 py-8">
      No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
    </div>
  );
}
