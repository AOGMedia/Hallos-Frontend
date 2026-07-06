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
    <div className="flex flex-col gap-[100px] min-h-screen rounded-2xl p-6" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(87, 229, 111, 0.15) 0%, rgba(10, 158, 178, 0.10) 50%, transparent 100%)' }}>
      {/* Top nav + hero */}
      <div className="flex flex-col gap-6">
        {/* Nav row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-10 border-b border-[rgba(136,140,148,0.20)] pb-[2px]">
            {NAV_TABS.map(({ key, label }) => (
              <button key={key} onClick={() => handleTabChange(key)}
                className={`text-base font-semibold pb-3 border-b-2 -mb-[2px] transition-colors whitespace-nowrap ${
                  activeNavTab === key
                    ? 'text-text-primary border-text-primary'
                    : 'text-text-gray border-transparent hover:text-text-primary'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/20 bg-[rgba(106,87,229,0.01)] text-[rgba(229,229,229,0.95)] text-base font-bold hover:bg-white/5 transition-colors flex-shrink-0"
            style={{ boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.30)' }}>
            <Plus size={14} /> Create new
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center gap-[10px] text-center pt-10">
          <h1
            className="text-[36px] leading-[45px] font-extrabold text-text-primary"
            style={{ opacity: 0.35 }}
          >
            Join communities
          </h1>
          <p className="text-base font-medium text-text-gray max-w-[380px] leading-[20px]">
            A snapshot of activity, knowledge, and opportunities in your community
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex items-center gap-[10px] flex-wrap justify-center">
          {STAT_BADGES.map(({ label, color, border, bg }) => (
            <span key={label} className="flex items-center gap-[10px] px-4 py-[10px] rounded-full text-xs font-medium"
              style={{ border: `1px solid ${border}`, background: bg, color }}>
              {label}
            </span>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full max-w-[550px] mx-auto flex items-center gap-3 px-5 py-3.5 rounded-full border border-border bg-transparent">
          <Search size={20} className="text-text-gray flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search communities"
            className="flex-1 bg-transparent text-sm font-normal text-text-gray outline-none placeholder:text-text-gray"
          />
        </div>
      </div>

      {/* Community grid */}
      <div className="flex flex-col gap-8">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading ? (
            <p className="col-span-full text-center text-text-gray py-12">Loading communities...</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-center text-text-gray py-12">No communities found.</p>
          ) : (
            filtered.map(c => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <CommunityCard community={c} onNavigate={(c) => router.push('/dashboard/community/' + c.id)} />
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Pagination Controls */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-border text-sm font-medium text-text-primary disabled:opacity-30 hover:bg-white/5 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-text-gray">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={filtered.length < limit}
              className="px-4 py-2 rounded-full border border-border text-sm font-medium text-text-primary disabled:opacity-30 hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
