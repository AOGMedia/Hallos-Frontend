'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getVideos, type VideoListItem } from '@/lib/api/videos';
import { formatTime } from '@/lib/video/playerUtils';

const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

interface Current { id: string; userId?: string | number; category?: string }

/** The same creator's videos first, then the same category, then the rest. */
function rank(list: VideoListItem[], current: Current) {
  const score = (v: VideoListItem) =>
    (current.userId != null && String(v.userId) === String(current.userId) ? 2 : 0) +
    (current.category && v.category === current.category ? 1 : 0);
  return list
    .filter((v) => v.id !== current.id && v.type !== 'short' && v.status === 'ready')
    .sort((a, b) => score(b) - score(a) || (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 12);
}

/** "Up next" videos for this one (the page uses the result to lay itself out). */
export function useUpNext(current: Current) {
  const { data, isLoading } = useQuery({ queryKey: ['videos-feed'], queryFn: () => getVideos(), staleTime: 60_000 });
  return { items: data ? rank(data, current) : [], isLoading };
}

/** The list: a column beside the player on desktop, under the details on phones. */
export function UpNextList({ items, isLoading }: { items: VideoListItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <div className="aspect-video w-40 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="flex-1 space-y-2 py-1"><div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" /><div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" /></div>
          </div>
        ))}
      </div>
    );
  }
  if (!items.length) return null;

  return (
    <section aria-labelledby="up-next" className="flex flex-col gap-3">
      <h2 id="up-next" className="text-base font-semibold text-text-primary">Up next</h2>
      <ul className="flex flex-col gap-3">
        {items.map((v) => (
          <li key={v.id}>
            <Link href={`/dashboard/video/${v.id}`} className="group flex gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-white/[0.06] sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails come from several hosts */}
                <img src={v.thumbnailUrl || '/images/video-thumbnail-1.svg'} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                {v.durationSeconds ? (
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[11px] font-medium tabular-nums text-white">{formatTime(v.durationSeconds)}</span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1 py-0.5">
                <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary">{v.title}</span>
                {v.author && <span className="mt-1 block truncate text-xs text-text-muted">{v.author}</span>}
                <span className="block text-xs text-text-muted">{compact(v.viewsCount ?? 0)} views</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
