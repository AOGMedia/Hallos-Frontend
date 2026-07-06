import React from 'react';
import { Globe, Bookmark } from 'lucide-react';
import { getCourseGradient } from '@/lib/courseVisuals';
import Image from 'next/image';

interface BrandCardProps {
  id: string;
  name: string;
  category: string;
  logo?: string;
  website: string;
  email: string;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const BrandCard = React.memo(function BrandCard({
  id,
  name,
  category,
  logo,
  website,
  // email,
  isSaved = false,
  onSave,
  onClick,
}: BrandCardProps) {
  const firstLetter = name.charAt(0).toUpperCase();
  const gradient = getCourseGradient(id);

  return (
    <div 
      className="bg-[#1C2333] rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(106,87,229,0.3)] transition-all overflow-hidden cursor-pointer"
      onClick={() => onClick?.(id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-[50px] h-[50px] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: !logo ? gradient.gradient : undefined }}
          >
            {logo ? (
              <Image 
                src={logo} 
                alt={name} 
                width={50}
                height={50}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.style.background = gradient.gradient;
                }}
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: gradient.textColor }}
              >
                {firstLetter}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-white font-semibold text-base leading-tight mb-1 truncate">
              {name}
            </h3>
            <p className="text-[#8B8B8B] text-sm leading-tight">{category}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-[#8B8B8B] hover:text-white text-sm transition-colors group"
          >
            <Globe className="w-4 h-4 flex-shrink-0 text-[#8B8B8B] group-hover:text-white" />
            <span className="truncate">{website}</span>
          </a>
          {/* <a
            href={`mailto:${email}`}
            className="flex items-center gap-2.5 text-[#8B8B8B] hover:text-white text-sm transition-colors group"
          >
            <Mail className="w-4 h-4 flex-shrink-0 text-[#8B8B8B] group-hover:text-white" />
            <span className="truncate">{email}</span>
          </a> */}
        </div>
      </div>

      <div className="bg-[#252D3F] px-4 py-1 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave?.(id);
          }}
          className="flex items-center gap-2 text-[#8B8B8B] hover:text-white text-sm transition-colors group"
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${
              isSaved
                ? 'fill-[#6a57e5] text-[#6a57e5]'
                : 'text-[#8B8B8B] group-hover:text-white'
            }`}
          />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
});
