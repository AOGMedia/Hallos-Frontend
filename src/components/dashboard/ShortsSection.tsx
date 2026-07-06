import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { ShortVideoCard } from "./ShortVideoCard";
import { memo, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useScrollArrows } from "@/hooks/useScrollArrows";

interface ShortsSectionProps {
  shorts: Array<{
    id: string;
    title: string;
    thumbnail: string;
    views: number;
  }>;
  loading?: boolean;
}

export const ShortsSection = memo(function ShortsSection({
  shorts,
  loading,
}: ShortsSectionProps) {
  const placeholders = useMemo(() => Array.from({ length: 8 }), []);
  const items = useMemo(() => shorts, [shorts]);
  
  const { scrollContainerRef, showLeftArrow, showRightArrow, scroll, checkScroll } = useScrollArrows({
    scrollAmount: 300,
    threshold: 1
  });

  // Check scroll arrows after shorts are loaded
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
        title="Shorts"
        icon={
          // <svg viewBox="0 0 20 20" fill="none" className="w-full h-full">
          //   <rect width="20" height="20" rx="4" fill="currentColor" className="text-primary" />
          //   <path d="M8 6L14 10L8 14V6Z" fill="white" />
          // </svg>
          <Film color="#888c94" />
        }
        showViewAll
        viewAllHref="/dashboard/shorts"
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

        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 px-4 lg:px-0 scrollbar-hide">
          {loading
            ? placeholders.map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden flex-shrink-0 w-full sm:w-[180px] lg:w-[252px]"
                >
                  <motion.div
                    className="w-full aspect-[3/4] rounded-xl bg-white/10"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <div className="p-4 flex flex-col gap-2">
                    <motion.div
                      className="h-4 w-2/3 rounded bg-white/10"
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
              ))
            : items.map((short) => (
                <ShortVideoCard key={short.id} short={short} />
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

      {/* Create Shorts Button */}
      <button className="flex items-center text-center gap-3 mt-6 text-regular hover:opacity-80 transition-opacity">
        <span className="bg-[#6A57E51A] p-4 rounded-full">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="w-5.5 h-5.5"
          >
            <path
              d="M11 0V22M0 11H22"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
          </svg>
        </span>
        <span>
          <Link href="/dashboard/create" className="text-sm font-medium">
            Create shorts
          </Link>
        </span>
      </button>
    </section>
  );
});
