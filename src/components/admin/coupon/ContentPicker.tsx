'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search, 
  ChevronDown, 
  Loader2, 
  Video, 
  Radio, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ContentType, UserPickerOption } from '@/types/coupon';
import { getVideos } from '@/lib/api/videos';
import { getMyLiveClasses } from '@/lib/api/live';
import { listSeries } from '@/services/seriesService';

export interface ContentOption {
  value: string;
  label: string;
  type: ContentType;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: 'Videos',
  live_class: 'Live Classes',
  live_series: 'Live Series',
};

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video size={13} />,
  live_class: <Radio size={13} />,
  live_series: <RefreshCw size={13} />,
};

interface ContentPickerProps {
  selectedUser: UserPickerOption | null;
  applicableContentTypes: ContentType[];
  selectedContent: ContentOption[];
  onToggleContent: (option: ContentOption) => void;
  onUpdateApplicableTypes: (types: ContentType[]) => void;
}

export default function ContentPicker({ 
  selectedUser, 
  applicableContentTypes, 
  selectedContent, 
  onToggleContent,
  onUpdateApplicableTypes
}: ContentPickerProps) {
  const [allContent, setAllContent] = useState<ContentOption[]>([]);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contentSearch, setContentSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch content for selected user
  useEffect(() => {
    if (selectedUser) {
      setIsFetchingContent(true);
      Promise.all([
        getVideos({ userId: String(selectedUser.id) }).catch(() => []),
        getMyLiveClasses().catch(() => ({ liveClasses: [] })),
        listSeries().catch(() => []),
      ]).then(([videos, liveRes, series]) => {
        const videoOpts: ContentOption[] = videos
           .filter(v => String(v.userId) === String(selectedUser.id))
           .map(v => ({ value: v.id, label: v.title, type: 'video' as ContentType }));
        const classOpts: ContentOption[] = (liveRes.liveClasses || [])
          .filter(c => String(c.userId) === String(selectedUser.id))
          .map(c => ({ value: c.id, label: c.title || 'Untitled', type: 'live_class' as ContentType }));
        const seriesOpts: ContentOption[] = series
          .filter(s => String(s.userId) === String(selectedUser.id))
          .map(s => ({ value: s.id, label: s.title, type: 'live_series' as ContentType }));
        
        setAllContent([...videoOpts, ...classOpts, ...seriesOpts]);
      }).finally(() => setIsFetchingContent(false));
    } else {
      setAllContent([]);
    }
  }, [selectedUser]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredOptions = allContent.filter((c: ContentOption) => {
    const matchesType = applicableContentTypes.length === 0 || applicableContentTypes.includes(c.type);
    const matchesSearch = !contentSearch || c.label.toLowerCase().includes(contentSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedOptions = filteredOptions.reduce<Record<string, ContentOption[]>>((acc, opt) => {
    if (!acc[opt.type]) acc[opt.type] = [];
    acc[opt.type].push(opt);
    return acc;
  }, {});

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-[2rem] space-y-4">
      <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest mb-2 flex items-center gap-2">
        <Filter size={14} className="text-emerald-400" /> Content Targeting
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
            Applicable Content Types
          </label>
          <div className="flex flex-wrap gap-2">
            {(['video', 'live_class', 'live_series'] as ContentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const newTypes = applicableContentTypes.includes(type)
                    ? applicableContentTypes.filter(t => t !== type)
                    : [...applicableContentTypes, type];
                  onUpdateApplicableTypes(newTypes);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                  applicableContentTypes.includes(type)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div ref={dropdownRef}>
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">
            Specific Content (Optional)
          </label>
          
          {selectedContent.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedContent.map(c => (
                <span key={c.value} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 font-bold">
                  {c.label}
                  <button type="button" onClick={() => onToggleContent(c)} className="hover:text-white ml-0.5"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <button 
              type="button" 
              disabled={!selectedUser}
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-400 hover:border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {!selectedUser 
                  ? 'Select a user first...' 
                  : selectedContent.length > 0 
                    ? `${selectedContent.length} items selected` 
                    : 'Choose specific content...'}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[30] overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-950/30">
                    <Search size={14} className="text-zinc-500 shrink-0" />
                    <input 
                      autoFocus 
                      value={contentSearch} 
                      onChange={e => setContentSearch(e.target.value)} 
                      placeholder="Search creator's content..."
                      className="flex-1 bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-600" 
                    />
                  </div>
                  
                  <div className="max-h-52 overflow-y-auto scrollbar-hide">
                    {isFetchingContent ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Scanning content...</p>
                      </div>
                    ) : Object.keys(groupedOptions).length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">
                        No matching content found
                      </div>
                    ) : (
                      Object.entries(groupedOptions).map(([type, options]) => (
                        <div key={type}>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/50 border-y border-zinc-800/30">
                            <span className="text-orange-500">{CONTENT_TYPE_ICONS[type]}</span>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{CONTENT_TYPE_LABELS[type]}</span>
                          </div>
                          {options.map(opt => {
                            const isSelected = selectedContent.some(c => c.value === opt.value);
                            return (
                              <button 
                                key={opt.value} 
                                type="button" 
                                onClick={() => onToggleContent(opt)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-zinc-800 ${isSelected ? 'text-zinc-100' : 'text-zinc-500'}`}
                              >
                                <span className="truncate text-left font-medium">{opt.label}</span>
                                {isSelected && <CheckCircle2 size={14} className="text-emerald-500 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[9px] text-zinc-600 mt-2 italic flex items-center gap-1">
            <AlertCircle size={10} /> Leave empty to apply to all content of selected types.
          </p>
        </div>
      </div>
    </div>
  );
}
