'use client';

import Image from 'next/image';
import { Bookmark, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFreebiesStore } from '@/store/freebiesStore';
import type { Freebie } from '@/types/freebie';

interface FreebieRowProps {
  freebie: Freebie;
  onView: (freebie: Freebie) => void;
}

const formatDownloads = (n: number) =>
  n >= 1000 ? `${Math.round(n / 1000)}k downloads` : `${n} downloads`;

export function FreebieRow({ freebie, onView }: FreebieRowProps) {
  const { toggleSaveLocally, savedIds } = useFreebiesStore();
  const isSaved = savedIds.includes(freebie.id);
  const creatorName = freebie.creator?.name || freebie.creatorName || (freebie.creator?.firstname ? `${freebie.creator.firstname} ${freebie.creator.lastname || ''}` : 'Anonymous');
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[10px] backdrop-blur-[60px] border border-white/5 hover:border-white/10 transition-colors"
    >
      {/* File info */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="shrink-0">
          <Image src="/icons/freebie-file.svg" alt="" width={40} height={40} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-base font-medium text-text-primary truncate">{freebie.title}</p>
          <p className="text-sm font-normal text-text-muted line-clamp-1">{freebie.description}</p>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2.5 sm:min-w-[160px]">
        {freebie.creator?.avatar ? (
          <Image
            src={freebie.creator.avatar}
            alt={creatorName}
            width={32}
            height={32}
            className="rounded-full object-cover shrink-0 bg-zinc-800"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
            {creatorName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-base font-medium text-text-gray truncate">{creatorName}</span>
      </div>

      {/* Downloads + Bookmark */}
      <div className="flex items-center gap-4">
        {/* Price Badge */}
        <div className={`px-2 py-1 rounded-[6px] text-xs font-bold ${
          freebie.price > 0 
            ? 'bg-primary/20 text-primary border border-primary/30' 
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {freebie.price > 0 ? `${freebie.currency} ${freebie.price}` : 'FREE'}
        </div>

        <div className="flex items-center gap-1.5">
          <Download size={14} className="text-text-gray" />
          <span className="text-sm font-normal text-text-gray leading-none">
            {formatDownloads(freebie.downloadCount || 0)}
          </span>
        </div>
        <button
          onClick={() => toggleSaveLocally(freebie.id)}
          aria-label="Save to library"
          className="text-text-gray hover:text-text-primary transition-colors cursor-pointer"
        >
          <Bookmark size={15} className={isSaved ? 'fill-primary text-primary' : ''} />
        </button>
      </div>

      {/* View action */}
      <button
        onClick={() => onView(freebie)}
        className="text-sm font-semibold text-primary underline hover:text-primary/80 transition-colors shrink-0"
      >
        View
      </button>
    </motion.div>
  );
}
