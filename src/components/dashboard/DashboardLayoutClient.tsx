'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { mockRootProps } from "@/app/dashboard/dashboardMockData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { usePromoStore } from '@/store/promoStore';
import { PromoModal, PromoCompactBanner } from '@/components/promo';
import { listLiveClassesExternal } from '@/services/liveClassService';
import { listSeries } from '@/services/seriesService';

const GlobalFeedback = dynamic(() => import('@/components/ui/GlobalFeedback'), {
  ssr: false,
});

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { modalDismissed, bannerDismissed, dismissModal, dismissBanner } = usePromoStore();
  const [modalReopened, setModalReopened] = useState(false);

  // Fetch live classes count
  const { data: liveClassesData } = useQuery({
    queryKey: ['header-live-classes-count'],
    queryFn: listLiveClassesExternal,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: 'always',
  });

  // Fetch live series count
  const { data: seriesData } = useQuery({
    queryKey: ['header-live-series-count'],
    queryFn: () => listSeries(),
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: 'always',
  });

  // Calculate total live schedules (classes + series)
  const liveSchedulesCount = useMemo(() => {
    const classesCount = liveClassesData?.length || 0;
    const seriesCount = seriesData?.length || 0;
    return classesCount + seriesCount;
  }, [liveClassesData, seriesData]);

   // Redirect to signin if not logged in
  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/signin?redirect=" + encodeURIComponent(pathname));
    }
  }, [user, userLoading, pathname, router]);

  // Redirect admin users to admin panel
  useEffect(() => {
    if (user && !userLoading && user.role === 'admin') {
      console.log('🔒 Admin user detected in dashboard, redirecting to /admin');
      router.push('/admin');
    }
  }, [user, userLoading, router]);

  // Show nothing until redirect or user is loaded
 if (userLoading || !user) return null;
 
  // Don't render dashboard for admin users (they'll be redirected)
  if (user.role === 'admin') return null;
  
  // Check if we're on a video page
  const isVideoPage = pathname?.startsWith('/dashboard/video/') || pathname?.startsWith('/dashboard/events') || pathname?.startsWith('/dashboard/campaign/quiz');
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      <Sidebar 
        className="lg:w-[247px]" 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      <div className={`flex-1 ${!isVideoPage ? 'lg:ml-[247px]' : ''}`}>
        <div className={`sticky top-0 z-40 ${!isVideoPage ? '' : 'hidden'}`}>
          {!isVideoPage && (
            <Header 
              stats={{
                ...mockRootProps.stats,
                liveSchedules: liveSchedulesCount,
              }} 
              onToggleSidebar={toggleSidebar}
            />
          )}
          {!isVideoPage && modalDismissed && !bannerDismissed && (
            <PromoCompactBanner onDismiss={dismissBanner} onOpenModal={() => setModalReopened(true)} />
          )}
        </div>
        <main className={!isVideoPage ? "px-2 py-6 lg:px-10 lg:py-16 max-w-[1100px] mx-auto" : ""}>
          {children}
        </main>
      </div>
      <GlobalFeedback />
      {(!modalDismissed || modalReopened) && <PromoModal onClose={() => { dismissModal(); setModalReopened(false); }} />}
    </div>
  );
}