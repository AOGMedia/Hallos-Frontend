'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getVideos } from '@/lib/api/videos';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { SquarePlay, Film, ArrowLeft, UserSearch } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { VideoCard } from '@/components/dashboard/VideoCard';
import { ShortVideoCard } from '@/components/dashboard/ShortVideoCard';

function SearchContent() {
  const params = useSearchParams();
  const query = (params.get('query') || '').toLowerCase().trim();

  const { data, isLoading } = useQuery({
    queryKey: ['search-all'],
    queryFn: () => getVideos(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });

  const { videos, shorts } = useMemo(() => {
    const src = (data || []);
    const matched = query
      ? src.filter(v => (v.title || '').toLowerCase().includes(query) || (v.description || '').toLowerCase().includes(query))
      : src;
    const longs = matched.filter(v => v.type === 'long' || v.type === undefined).map(v => ({
      id: v.id,
      title: v.title,
      description: v.description || '',
      thumbnail: v.thumbnailUrl || '/images/video-thumbnail-1.svg',
      author: 'Creator',
      authorAvatar: '/images/instructor-avatar.jpg',
      isLive: false,
      duration: Math.max(0, v.durationSeconds ?? 0),
      postedDate: v.createdAt ? new Date(v.createdAt) : new Date(),
      rating: 0,
      ratingCount: 0,
      price: v.price,
      currency: v.currency,
    }));
    const shorts = matched.filter(v => v.type === 'short').map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl || '/images/video-thumbnail-1.svg',
      views: v.viewsCount ?? 0,
    }));
    return { videos: longs, shorts };
  }, [data, query]);

  const showEmpty = !isLoading && videos.length === 0 && shorts.length === 0;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-regular hover:opacity-80">
          <ArrowLeft className="w-4 h-4 text-[#888c94]" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      <SectionHeader title="Search Results" icon={<UserSearch color="#888c94" />} />
      <div className="text-description">{videos.length + shorts.length} results {query ? `for "${query}"` : ''}</div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} className="w-full aspect-video rounded-xl bg-white/10" initial={{ opacity: 0.4 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }} />
          ))}
        </div>
      ) : showEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="text-heading-small">No results found</div>
          <div className="text-description">Try a different search term.</div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-regular hover:opacity-80">
              <ArrowLeft className="w-4 h-4 text-[#888c94]" />
              <span>Back to dashboard</span>
            </Link>
            <Link href="/dashboard/shorts" className="flex items-center gap-2 text-regular hover:opacity-80">
              <ArrowLeft className="w-4 h-4 text-[#888c94]" />
              <span>Back to all shorts</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {videos.length > 0 && (
            <div className="space-y-4">
              <SectionHeader title="Videos" icon={<SquarePlay color="#888c94" />} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {videos.map(v => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-1 sm:p-2">
                    <VideoCard video={v} variant="grid" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {shorts.length > 0 && (
            <div className="space-y-4">
              <SectionHeader title="Shorts" icon={<Film color="#888c94" />} />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {shorts.map(s => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-1 sm:p-2">
                    <ShortVideoCard short={s} variant="grid" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}