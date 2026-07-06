'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVideos } from '@/lib/api/videos';
import { ShortVideoCard } from '@/components/dashboard/ShortVideoCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { Film, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function ShortsContent() {
  const params = useSearchParams();
  const query = params.get('query')?.toLowerCase() ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['shorts-list'],
    queryFn: () => getVideos({ type: 'short' }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });

  const items = useMemo(() => {
    const src = (data || []);
    const mapped = src.map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl || '/images/video-thumbnail-1.svg',
      views: v.viewsCount ?? 0,
    }));
    if (!query) return mapped;
    return mapped.filter(s => s.title.toLowerCase().includes(query));
  }, [data, query]);

  const placeholders = useMemo(() => Array.from({ length: 12 }), []);

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-regular hover:opacity-80">
          <ArrowLeft className="w-4 h-4 text-[#888c94]" />
          <span>Back </span>
        </Link>
      </div>
      {query && (
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard/shorts" className="flex items-center gap-2 text-regular hover:opacity-80">
            <ArrowLeft className="w-4 h-4 text-[#888c94]" />
            <span>Back to all Thrillers</span>
          </Link>
        </div>
      )}
      <SectionHeader title="All Shorts" icon={<Film color="#888c94" />} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading ? (
          placeholders.map((_, i) => (
            <div key={i} className="overflow-hidden w-full">
              <motion.div
                className="w-full aspect-[3/4] rounded-xl bg-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              />
              <div className="p-3">
                <motion.div className="h-4 w-3/4 rounded bg-white/10" initial={{ opacity: 0.4 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-heading-small">No Thriller found</div>
            <div className="text-description">Try a different search term.</div>
            <Link href="/dashboard/shorts" className="flex items-center gap-2 text-regular hover:opacity-80">
              <ArrowLeft className="w-4 h-4 text-[#888c94]" />
              <span>Back to all shorts</span>
            </Link>
          </div>
        ) : (
          items.map(short => (
            <motion.div key={short.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ShortVideoCard short={short} variant="grid" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ShortsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ShortsContent />
    </Suspense>
  );
}