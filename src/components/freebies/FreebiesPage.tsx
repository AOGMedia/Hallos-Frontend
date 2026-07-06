'use client';

import { useMemo } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { FreebieRow } from './FreebieRow';
import { useFreebiesStore } from '@/store/freebiesStore';
import { useFreebiesList } from '@/hooks/useFreebies';
import type { FreebieTab } from '@/types/freebie';

// Dynamic imports for heavy modals (Rule 4)
const FreebieDetailModal = dynamic(() => import('./FreebieDetailModal').then(m => m.FreebieDetailModal), { 
  ssr: false,
  loading: () => null 
});

const UploadFreebiesModal = dynamic(() => import('./UploadFreebiesModal').then(m => m.UploadFreebiesModal), { 
  ssr: false,
  loading: () => null
});

const TABS: { key: FreebieTab; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'saved', label: 'Saved' },
  { key: 'mine', label: 'Mine' },
];

export function FreebiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL-based tab state (Rule 1 & 3)
  const activeTab = (searchParams.get('tab') as FreebieTab) || 'top';

  const {
    selectedFreebieId, isDetailModalOpen, closeDetail,
    openDetail, openUpload, savedIds
  } = useFreebiesStore();

  // Data fetching using React Query (Rule 2 & 8)
  const { data, isLoading: loading } = useFreebiesList(activeTab);
  const freebies = useMemo(() => data?.freebies || [], [data?.freebies]);

  const setActiveTab = (tab: FreebieTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  const displayedFreebies = useMemo(() => {
    if (activeTab === 'saved') {
      // For the saved tab, we filter from the global list or the specific 'saved' list if the API supports it
      // Currently, it filters based on persisted savedIds
      return freebies.filter((f) => savedIds.includes(f.id));
    }
    return freebies;
  }, [activeTab, freebies, savedIds]);

  return (
    <div className="flex flex-col gap-6">
      {/* Tab nav + Upload button */}
      <div className="flex items-center justify-between gap-4 border-b border-text-gray/20 pb-0">
        <div className="flex items-center gap-10">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-base font-semibold pb-3 border-b-2 transition-colors ${
                activeTab === key
                  ? 'text-text-primary border-text-primary'
                  : 'text-text-gray border-transparent hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={openUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors mb-3"
        >
          <Upload size={15} />
          <span>Upload</span>
        </button>
      </div>

      {/* List */}
      <motion.div layout className="flex flex-col gap-6">
        {loading && freebies.length === 0 ? (
          <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : displayedFreebies.length === 0 ? (
          <p className="text-center text-text-gray py-12">No items found in Library.</p>
        ) : (
          displayedFreebies.map((freebie) => (
            <FreebieRow key={freebie.id} freebie={freebie} onView={(f) => openDetail(f.id)} />
          ))
        )}
      </motion.div>

      {/* Modals — only render when needed or use dynamic internal logic */}
      {isDetailModalOpen && (
        <FreebieDetailModal 
          freebieId={selectedFreebieId} 
          isOpen={isDetailModalOpen} 
          onClose={closeDetail} 
        />
      )}
      <UploadFreebiesModal title="Upload to Library" />
    </div>
  );
}
