import Image from 'next/image';
import Link from 'next/link';
import { formatViewCount } from '@/utils/formatters';
import { Eye, TrashIcon } from 'lucide-react';
import { memo } from 'react';

interface ShortVideoCardProps {
  short: {
    id: string;
    title: string;
    thumbnail: string;
    views: number;
  };
  variant?: 'grid' | 'carousel';
  className?: string;
  onDelete?: (e: React.MouseEvent) => void;
}

export const ShortVideoCard = memo(function ShortVideoCard({ short, variant = 'carousel', className = '', onDelete }: ShortVideoCardProps) {
  const base = "short-card overflow-hidden group cursor-pointer";
  const variantCls = variant === 'carousel' ? "flex-shrink-0 w-full sm:w-[180px] lg:w-[252px]" : "w-full";
  return (
    <Link href={`/dashboard/video/${short.id}`} className={`${base} ${variantCls} ${className}`}>
      {/* Thumbnail */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <Image
          src={short.thumbnail}
          alt={short.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M0 0V14L12 7L0 0Z" fill="white" />
            </svg>
          </div>
        </div>
        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(e);
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
            title="Delete Short"
          >
            <TrashIcon className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-medium line-clamp-2">{short.title}</h4>
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3 text-[#888c94]" />
          <span className="text-small font-semibold">{formatViewCount(short.views)}</span>
        </div>
      </div>
    </Link>
  );
});