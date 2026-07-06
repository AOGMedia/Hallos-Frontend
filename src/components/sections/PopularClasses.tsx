'use client';

import { Button } from "@/components/ui/Button";
import LiveDotIcon from "@/components/icons/LiveDotIcon";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listLiveClassesExternal
  // , type LiveClass
 } from '@/services/liveClassService';
import { listSeries } from '@/services/seriesService';
// import type { Series } from '@/types/series';
import { CourseCard } from "@/components/course/CourseCard";
import { SeriesScheduleCard } from "@/components/schedule/SeriesScheduleCard";

const MOCK_COURSES = [
  {
    id: "2",
    title: "Upskill with easy-to-follow courses",
    description:
      "stay up to date with industry trends and master the latest tools with our expert-led courses",
    instructor: "Hallos Creator",
    thumbnail:
      "https://res.cloudinary.com/dblsgkbk4/image/upload/v1770673636/how_w8f44h.png",
    avatar: "/avatars/alex-chapman.jpg",
    duration: "1hr",
    posted: "2d ago",
    rating: 4.8,
    reviews: "20k",
    isLive: false,
  },
  {
    id: "3",
    title: "Graphic Design PRO",
    description:
      "Scale up your design skills to match modern styles with modern tools",
    instructor: "Alex Chapman",
    thumbnail:
      "https://res.cloudinary.com/dblsgkbk4/image/upload/v1770673508/data_course_qngavg.png",
    avatar: "/avatars/alex-chapman.jpg",
    duration: "2hr",
    posted: "10d ago",
    rating: 4.8,
    reviews: "20k",
    isLive: false,
  },
  {
    id: "4",
    title: "Find Data Analysis Up to Date courses",
    description:
      "Master the latest tools and techniques in data analysis to stay ahead in your career",
    instructor: "Data Analysis Pro",
    thumbnail: "https://res.cloudinary.com/dblsgkbk4/image/upload/v1770673649/mart_a8wfyg.png",
    avatar: "/avatars/alex-chapman.jpg",
    duration: "22hr",
    posted: "4d ago",
    rating: 4.8,
    reviews: "20k",
    isLive: false,
  },
];

// Helper function to format duration
function formatDuration(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "1hr";
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}hr ${minutes}min` : `${hours}hr`;
  }
  return minutes > 0 ? `${minutes}min` : "1hr";
}

// Fetch live content
async function fetchLiveContent() {
  try {
    console.log('[PopularClasses] Starting to fetch live content...');
    
    // Fetch without filters first to see all series
    const [liveClasses, allSeries] = await Promise.all([
      listLiveClassesExternal(),
      listSeries(), // Try without filters
    ]);

    console.log('[PopularClasses] Fetched live classes:', liveClasses.length, liveClasses);
    console.log('[PopularClasses] Fetched ALL series (no filters):', allSeries.length, allSeries);

    // Filter valid classes (not ended/recorded, public only)
    const validClasses = liveClasses.filter(
      (c) => c.status !== 'ended' && c.status !== 'recorded' && c.privacy !== 'private'
    );

    // Filter series manually to ensure we get public active ones
    const validSeries = allSeries.filter(
      (s) => s.status === 'active' && s.privacy === 'public'
    );

    console.log('[PopularClasses] Valid classes after filtering:', validClasses.length);
    console.log('[PopularClasses] Valid series after filtering:', validSeries.length, validSeries);
    console.log('[PopularClasses] Returning data:', { classes: validClasses, series: validSeries });

    return { classes: validClasses, series: validSeries };
  } catch (error) {
    console.error('[PopularClasses] Error fetching live content:', error);
    return { classes: [], series: [] };
  }
}

export function PopularClasses() {

  // Fetch live content with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['landing-live-classes'],
    queryFn: fetchLiveContent,
    staleTime: 60000, // 60 seconds
    gcTime: 300000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });

  // Log errors for debugging
  if (isError && error) {
    console.error('Error fetching live content for landing page:', error);
  }

  const liveClasses = data?.classes || [];
  const liveSeries = data?.series || [];
  const hasLiveContent = liveClasses.length > 0 || liveSeries.length > 0;

  // Log for debugging


  if (!isLoading && !isError) {
    console.log('[PopularClasses] Using', hasLiveContent ? 'live' : 'mock', 'data');
  }

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-center lg:justify-center sm:justify-start gap-4 mb-8 sm:mb-12">
          <LiveDotIcon
            width={32}
            height={32}
            className="sm:w-10 sm:h-10 animate-pulse"
          />
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight">
            Popular <span className="text-accent-red">Live</span> Classes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {hasLiveContent ? (
            <>
              {/* Render live classes */}
              {liveClasses.slice(0, 2).map((c) => {
                const now = new Date();
                const startTime = c.startTime ? new Date(c.startTime) : null;
                const endTime = c.endTime ? new Date(c.endTime) : null;
                const isLiveNow = c.status === "live" || 
                  (startTime && endTime && now >= startTime && now <= endTime);

                const scheduledFor = c.status === "scheduled" && !isLiveNow && c.startTime
                  ? c.startTime
                  : undefined;

                return (
                  <CourseCard
                    key={c.id}
                    id={c.id}
                    title={c.title}
                    description={c.description || "Join this live class"}
                    instructor={c.creatorName || "Hallbs Creator"}
                    thumbnail={c.thumbnailUrl || "https://res.cloudinary.com/dblsgkbk4/image/upload/v1770673636/how_w8f44h.png"}
                    avatar="/avatars/alex-chapman.jpg"
                    price={typeof c.price === "number" ? c.price : Number(c.price) || 0}
                    duration={formatDuration(c.startTime, c.endTime)}
                    posted={c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"}
                    rating={4.8}
                    reviews="20k"
                    isLive={Boolean(isLiveNow)}
                    scheduledFor={scheduledFor}
                    isPurchased={false}
                    href={`/live/${c.id}`}
                  />
                );
              })}

              {/* Render live series */}
              {liveSeries.slice(0, 3 - liveClasses.slice(0, 2).length).map((s) => {
                // Use the base currency the series was created with
                const baseCurrency = s.pricing?.base?.currency || s.currency || 'NGN';
                const seriesPrice = s.pricing
                  ? (baseCurrency === 'USD' ? s.pricing.usd : s.pricing.ngn)
                  : typeof s.price === 'string' ? parseFloat(s.price) : (s.price || 0);
                const seriesCurrency = baseCurrency;
                const isLive = (s.stats?.liveSessions || 0) > 0;

                return (
                  <div key={s.id} className="h-full">
                    <SeriesScheduleCard
                      id={s.id}
                      title={s.title}
                      description={s.description || "Join this recurring series"}
                      instructor={
                        s.creator
                          ? `${s.creator.firstname} ${s.creator.lastname}`
                          : "Hallbs Creator"
                      }
                      thumbnail={s.thumbnailUrl || "https://res.cloudinary.com/dblsgkbk4/image/upload/v1770673636/how_w8f44h.png"}
                      avatar="/avatars/alex-chapman.jpg"
                      price={seriesPrice}
                      currency={seriesCurrency}
                      href={`/series/${s.id}`}
                      isLive={isLive}
                      matchCourseCardHeight={liveClasses.slice(0, 2).length > 0}
                    />
                  </div>
                );
              })}
            </>
          ) : (
            /* Show mock data when no live content */
            MOCK_COURSES.map((course) => (
              <CourseCard key={course.id} {...course} isLandingPage={true} />
            ))
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            className="flex items-center gap-2 w-full sm:w-auto justify-center "
          >
            <Link href="/dashboard/schedule" className="flex items-center gap-2">
              View all
              <ArrowRightIcon width={18} height={14} color="#FFFFFF" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
