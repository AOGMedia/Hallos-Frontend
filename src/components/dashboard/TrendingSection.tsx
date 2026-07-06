import { memo, useMemo, useEffect } from 'react';
import { SquarePlay, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { VideoCard } from './VideoCard';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { useScrollArrows } from '@/hooks/useScrollArrows';
// import { CourseCard } from '../course/CourseCard';

interface TrendingSectionProps {
  videos: Array<{
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    author: string;
    authorAvatar: string;
    isLive: boolean;
    duration: number;
    postedDate: Date;
    rating: number;
    ratingCount: number;
    price?: number | string;
    currency?: string;
    userId?: string | number; // Creator ID for access control
  }>;
  loading?: boolean;
}

export const TrendingSection = memo(function TrendingSection({ videos, loading }: TrendingSectionProps) {
  const placeholders = useMemo(() => Array.from({ length: 8 }), []);
  const items = useMemo(() => videos, [videos]);
  
  const { scrollContainerRef, showLeftArrow, showRightArrow, scroll, checkScroll } = useScrollArrows({
    scrollAmount: 300,
    threshold: 1
  });

  // Check scroll arrows after videos are loaded
  useEffect(() => {
    if (!loading && items.length > 0) {
      setTimeout(() => {
        checkScroll();
      }, 150);
      setTimeout(() => {
        checkScroll();
      }, 500);
    }
  }, [loading, items, checkScroll]);

  return (
    <section className="mb-12 lg:mb-20">
      <SectionHeader
        title="Trending"
        icon={
          < SquarePlay color='#888c94'/>
        }
      />
      <div className="relative w-full -mx-4 lg:mx-0">
        {/* Left Arrow */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                scroll('left');
              }}
              className="w-8 h-full flex items-center justify-center bg-gradient-to-r from-[#0A0E1A]/60 to-transparent hover:from-[#0A0E1A]/80 transition-colors pointer-events-auto"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        <div ref={scrollContainerRef} className="flex gap-1 overflow-x-auto pb-4 px-4 lg:px-0 scrollbar-hide">
          {loading
            ? placeholders.map((_, i) => (
                <div key={i} className="overflow-hidden flex-shrink-0 w-full sm:w-[320px] lg:w-[352px] relative">
                  <motion.div
                    className="w-full aspect-video rounded-xl bg-white/10"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <div className="p-4 flex flex-col gap-4">
                    <motion.div
                      className="h-4 w-3/4 rounded bg-white/10"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-4 w-full rounded bg-white/10"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <motion.div
                        className="h-4 w-24 rounded bg-white/10"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <motion.div
                        className="h-4 w-16 rounded bg-white/10"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>
              ))
            : items.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  priceLabel={Number(video.price ?? 0) === 0 ? 'Free' : formatCurrency(video.price ?? 0, video.currency || 'NGN')}
                />
              ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                scroll('right');
              }}
              className="w-8 h-full flex items-center justify-center bg-gradient-to-l from-[#0A0E1A]/60 to-transparent hover:from-[#0A0E1A]/80 transition-colors pointer-events-auto"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
});