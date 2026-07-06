'use client';

import { X, Share2, ChevronRight } from 'lucide-react';
import { PROMO, handleShare } from './promoData';
import Image from 'next/image';

interface PromoCompactBannerProps {
  onDismiss: () => void;
  onOpenModal: () => void;
}

const BANNER_BG =
  'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), #ffffff';

export function PromoCompactBanner({ onDismiss, onOpenModal }: PromoCompactBannerProps) {
  return (
    <div
      className="mx-2 lg:mx-10 my-2 flex items-center gap-3 px-3 sm:px-4 rounded-[10px]"
      style={{ background: BANNER_BG, minHeight: '60px' }}
      role="banner"
      aria-label="Promotional offer"
    >
      {/* Icon */}
      <Image
        src="/icons/promo-gift-percent.svg"
        width={30}
        height={30}
        alt=""
        aria-hidden="true"
        className="shrink-0 w-[44px] h-[30px] sm:w-[60px] sm:h-[40px] object-contain"
      />

      {/* Text */}
      <p
        className="flex-1 min-w-0 truncate text-sm sm:text-base"
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 500,
          color: '#2d1b8a',
        }}
      >
        {PROMO.bodyParts.length === 3 ? (
          <>
            {PROMO.bodyParts[0]}
            <span style={{ color: '#c8a800', fontWeight: 700 }}>{PROMO.bodyParts[1]}</span>
            {PROMO.bodyParts[2]}
          </>
        ) : (
          PROMO.bodyParts.join('')
        )}
      </p>

      {/* Share CTA */}
      <button
        onClick={handleShare}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full transition-opacity hover:opacity-90 whitespace-nowrap"
        style={{
          background: '#6a57e5',
          boxShadow: '-2.35px 5.88px 14.12px rgba(42,29,122,0.30)',
        }}
        aria-label={PROMO.cta}
      >
        <Share2 size={10} color="#f2f2f2" />
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            color: '#ffffff',
          }}
          className="sm:text-[11px]"
        >
          {PROMO.cta}
        </span>
      </button>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
        aria-label="Dismiss promotion"
      >
        <X size={18} color="#888c94" />
      </button>
      <button
        onClick={onOpenModal}
        className='rounded-full cursor-pointer transition-opacity hover:opacity-80'
        aria-label="View promotion details"
        style={{
          background: '#6a57e5',
          boxShadow: '-2.35px 5.88px 14.12px rgba(42,29,122,0.30)',
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
