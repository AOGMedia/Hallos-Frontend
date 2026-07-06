"use client";
import { useMemo } from "react";
import Link from "next/link";
import { FeaturedVideo } from "@/components/dashboard/FeaturedVideo";
import { SpecialCoursesSection } from "@/components/dashboard/SpecialCoursesSection";
import { TrendingSection } from "@/components/dashboard/TrendingSection";
import { ShortsSection } from "@/components/dashboard/ShortsSection";
import { TopVideosSection } from "@/components/dashboard/TopVideosSection";
import { mockRootProps } from "./dashboardMockData";
import { useQuery } from "@tanstack/react-query";
// import { apiClient } from "@/lib/api/client";



import { getVideos } from "@/lib/api/videos";

export default function DashboardPage() {
  // const BASE_URL = apiClient.defaults.baseURL;


  const { data: allVideos, isLoading: videosLoading } = useQuery({
    queryKey: ["trending-videos"],
    queryFn: () => getVideos(),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
  });

  const trendingData = useMemo(() => (allVideos || [])
    .filter((v) => v.type === 'long' || v.type === undefined)
    .slice(0, 12)
    .map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description ?? '',
    thumbnail: v.thumbnailUrl??"/images/video-thumbnail-1.svg",
  
  //  thumbnail: v.playbackId
  //       ? `https://image.mux.com/${v.playbackId}/thumbnail.jpg?width=640`
  //       : v.thumbnailUrl
  //       ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")}${v.thumbnailUrl}`
  //       : "/images/video-thumbnail-1.svg",
    author: 'Creator',
    authorAvatar: "/public/images/instructor-avatar.jpg".replace('/public',''),
    isLive: false,
    duration: Math.max(0, v.durationSeconds ?? 0),
    postedDate: v.createdAt ? new Date(v.createdAt) : new Date(),
    rating: 0,
    ratingCount: 0,
    price: v.price ?? 0,
    currency: v.currency,
  })), [allVideos]);

  const shortsData = useMemo(() => (allVideos || [])
    .filter((v) => v.type === 'short')
    .slice(0, 12)
    .map((v) => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl || "/images/video-thumbnail-1.svg",
      views: v.viewsCount ?? 0,
    })), [allVideos]);

  const topTodayData = useMemo(() => (allVideos || [])
    .filter((v) => {
      const d = v.createdAt ? new Date(v.createdAt) : undefined;
      if (!d) return false;
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    })
    .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
    .slice(0, 4)
    .map((v, idx) => ({
      id: v.id,
      title: v.title,
      description: v.description ?? '',
      thumbnail: v.thumbnailUrl || "/images/video-thumbnail-1.svg",
      author: 'Creator',
      authorAvatar: "/images/instructor-avatar.jpg",
      isLive: false,
      duration: Math.max(0, v.durationSeconds ?? 0),
      postedDate: v.createdAt ? new Date(v.createdAt) : new Date(),
      rating: 0,
      ratingCount: 0,
      rank: idx + 1,
      price: v.price ?? 0,
      currency: v.currency,
    })), [allVideos]);
  return (
      <div className="w-full!">
        <FeaturedVideo video={mockRootProps.featuredVideo} />

        {/* Special Courses */}
        <SpecialCoursesSection />

        {/* Link to full courses page */}
        <div className="text-center mb-8">
          <Link 
            href="/course"
            className="text-[#6a57e5] text-sm font-medium hover:underline"
          >
            View All Courses →
          </Link>
        </div>

        {/* Trending Videos */}
        <TrendingSection videos={trendingData} loading={videosLoading} />

        {/* Shorts */}
        <ShortsSection shorts={shortsData} loading={videosLoading} />

        {/* Top Videos Today */}
        <TopVideosSection videos={topTodayData} />
      </div>
  );
}
