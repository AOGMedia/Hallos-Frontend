/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunityStore } from '@/store/communityStore';
import { CommunityCard } from './CommunityCard';
import { useCommunities, useMyCommunities } from '@/hooks/useCommunityAPI';
import type { Community } from '@/types/community';

const NAV_TABS = [
  { key: 'popular' as const, label: 'Popular' }, // Shows trending and most active communities on the platform
  { key: 'live-events' as const, label: 'Live events' }, // Shows communities with active live classes or upcoming scheduled events
  { key: 'my-communities' as const, label: 'My communities' }, // Shows communities you created (owner) or have joined (member)
] as const;

const STAT_BADGES = [
  {
    label: '120k+ communities',
    color: '#14c877',
    border: 'rgba(20,200,119,0.20)',
    bg: 'rgba(20,200,119,0.04)',
  },
  {
    label: '120k+ members',
    color: '#00abe4',
    border: 'rgba(0,171,228,0.20)',
    bg: 'rgba(0,171,228,0.04)',
  },
  {
    label: '250k events',
    color: '#d9c80f',
    border: 'rgba(217,200,15,0.20)',
    bg: 'rgba(217,200,15,0.04)',
  },
];

export function CommunityLanding() {
  const { searchQuery, setSearch, openCreate, activeNavTab, setNavTab } = useCommunityStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 21; // 3 columns * 7 rows

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['popular', 'live-events', 'my-communities'].includes(tab)) {
      setNavTab(tab);
    }
  }, [searchParams, setNavTab]);

  const handleTabChange = (key: 'popular' | 'live-events' | 'my-communities') => {
    setNavTab(key);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', key);
    router.replace(`?${params.toString()}`);
  };

  const { data: allResponse, isLoading: isAllLoading } = useCommunities(page, limit);
  const { data: myResponse, isLoading: isMyLoading } = useMyCommunities(page, limit);
  
  const isLoading = activeNavTab === 'my-communities' ? isMyLoading : isAllLoading;

  const communities: Community[] = useMemo(() => {
    const response = activeNavTab === 'my-communities' ? myResponse : allResponse;
    const rawData = response?.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && typeof rawData === 'object' && Array.isArray((rawData as any).communities)) {
      return (rawData as any).communities;
    }
    return [];
  }, [allResponse, myResponse, activeNavTab]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    // No need to filter locally for role anymore if using the specialized endpoint
    const list = communities;
    return q ? list.filter(c => c.name.toLowerCase().includes(q)) : list;
  }, [searchQuery, communities]);

  return (
    // Phones: tighter spacing, and room at the bottom for the floating quick-action button.
    <div className="flex flex-col gap-8 min-h-screen rounded-2xl px-3 pt-1 pb-28 sm:gap-16 sm:p-6 lg:gap-[100px]" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(87, 229, 111, 0.15) 0%, rgba(10, 158, 178, 0.10) 50%, transparent 100%)' }}>
      {/* Top nav + hero */}
      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Nav row: tabs (scroll sideways on narrow phones) + create */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div
            role="tablist"
            className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto border-b border-[rgba(136,140,148,0.20)] pb-[2px] scrollbar-hide sm:flex-none sm:gap-10"
          >
            {NAV_TABS.map(({ key, label }) => (
              <button key={key} role="tab" aria-selected={activeNavTab === key} onClick={() => handleTabChange(key)}
                className={`text-sm sm:text-base font-semibold pb-3 border-b-2 -mb-[2px] transition-colors whitespace-nowrap touch-manipulation ${
                  activeNavTab === key
                    ? 'text-text-primary border-text-primary'
                    : 'text-text-gray border-transparent hover:text-text-primary'
                }`}>
                {label}
              </button>
            ))}
          </div>
          {/* Phones: a round + button; larger screens: the full "Create new" pill. */}
          <button onClick={openCreate} aria-label="Create new community"
            className="flex h-10 w-10 flex-shrink-0 touch-manipulation items-center justify-center gap-2 rounded-full border border-white/20 bg-[rgba(106,87,229,0.01)] text-[rgba(229,229,229,0.95)] text-base font-bold transition-colors hover:bg-white/5 active:scale-95 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5"
            style={{ boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.30)' }}>
            <Plus size={16} className="sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Create new</span>
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center gap-2 text-center pt-3 sm:gap-[10px] sm:pt-10">
          <h1
            className="text-[26px] leading-[32px] font-extrabold text-text-primary sm:text-[36px] sm:leading-[45px]"
            style={{ opacity: 0.35 }}
          >
            Join communities
          </h1>
          <p className="text-sm font-medium text-text-gray max-w-[320px] leading-[20px] sm:text-base sm:max-w-[380px]">
            A snapshot of activity, knowledge, and opportunities in your community
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:gap-[10px]">
          {STAT_BADGES.map(({ label, color, border, bg }) => (
            <span key={label} className="flex items-center px-3 py-2 rounded-full text-[11px] font-medium sm:px-4 sm:py-[10px] sm:text-xs"
              style={{ border: `1px solid ${border}`, background: bg, color }}>
              {label}
            </span>
          ))}
        </div>

        {/* Search input — 16px text on phones so iPhone doesn't zoom in on tap */}
        <label className="relative w-full max-w-[550px] mx-auto flex h-12 items-center gap-3 px-4 rounded-full border border-border bg-white/[0.03] sm:h-auto sm:px-5 sm:py-3.5 sm:bg-transparent">
          <Search size={20} className="text-text-gray flex-shrink-0" />
          <input
            type="search"
            enterKeyHint="search"
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search communities"
            className="min-w-0 flex-1 bg-transparent text-base font-normal text-text-primary outline-none placeholder:text-text-gray sm:text-sm"
          />
        </label>
      </div>

      {/* Community grid */}
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {isLoading ? (
            <p className="col-span-full text-center text-text-gray py-12">Loading communities...</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-center text-text-gray py-12">No communities found.</p>
          ) : (
            filtered.map(c => (
              // Fade in only (no layout animation per card — lighter on phones).
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <CommunityCard community={c} onNavigate={(c) => router.push('/dashboard/community/' + c.id)} />
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-11 px-5 rounded-full border border-border text-sm font-medium text-text-primary disabled:opacity-30 hover:bg-white/5 active:scale-95 transition touch-manipulation sm:h-auto sm:px-4 sm:py-2"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-text-gray">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={filtered.length < limit}
              className="h-11 px-5 rounded-full border border-border text-sm font-medium text-text-primary disabled:opacity-30 hover:bg-white/5 active:scale-95 transition touch-manipulation sm:h-auto sm:px-4 sm:py-2"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
