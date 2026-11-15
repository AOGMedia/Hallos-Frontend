'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Megaphone, TriangleAlert, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Announcement } from './useAnnouncements';
import './announcements.css';

/** Same surface as the promo modal (components/promo/PromoModal). */
const MODAL_BG =
  'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636';
const PRIMARY = '#6a57e5';
const INK = '#2d1b8a';

const EYEBROW: Record<Announcement['tone'], string> = { success: 'Good news', info: 'Announcement', warning: 'Heads up' };

/** The picture at the top, by tone: the promo artwork for good news, a broadcast mark for news, a calm alert for notices. */
function Hero({ tone }: { tone: Announcement['tone'] }) {
  if (tone === 'success') {
    return (
      <div aria-hidden className="relative mx-auto h-40 w-full max-w-[420px] sm:h-48">
        <Image src="/images/promo-parachute.png" alt="" width={64} height={64} sizes="64px" className="announce-parachute absolute left-[6%] top-0 h-12 w-12 object-contain sm:h-16 sm:w-16" />
        <Image src="/images/promo-percent.png" alt="" width={110} height={110} sizes="110px" className="announce-percent absolute bottom-0 left-[18%] h-20 w-20 object-contain sm:h-[110px] sm:w-[110px]" />
        <Image src="/images/promo-gift.png" alt="" width={190} height={190} sizes="190px" className="announce-gift absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-[190px] sm:w-[190px]" />
        <Image src="/images/promo-coins.png" alt="" width={52} height={52} sizes="52px" className="announce-coins absolute right-[8%] top-[18%] h-10 w-10 object-contain sm:h-[52px] sm:w-[52px]" />
      </div>
    );
  }
  const warning = tone === 'warning';
  const fill = warning ? '#ffd42a' : PRIMARY;
  return (
    <div aria-hidden className="relative mx-auto flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
      <span className={`absolute inset-4 rounded-full ${warning ? 'announce-ring announce-ring-slow' : 'announce-ring'}`} style={{ background: fill }} />
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24" style={{ background: fill, boxShadow: '-4px 10px 24px rgba(42,29,122,0.45)' }}>
        {warning ? <TriangleAlert size={38} color={INK} /> : <Megaphone size={36} color="#ffffff" className="announce-wiggle" />}
      </span>
    </div>
  );
}

interface AnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
  /** Close it for good on this device (only offered when staff allowed closing). */
  onDismiss: (id: string) => void;
}

/**
 * The full announcement, opened from the bar, in the promo modal's style:
 * no clamped text, the link as a proper call to action, and (when allowed)
 * "Don't show this again". Rendered in a portal so the bar's animated
 * transforms can't trap the fixed overlay. Escape or the backdrop closes it,
 * the page behind doesn't scroll, and focus returns to where it was.
 */
export function AnnouncementModal({ announcement: a, onClose, onDismiss }: AnnouncementModalProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const external = a.linkUrl?.startsWith('http');

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] overflow-hidden rounded-3xl"
        style={{ background: MODAL_BG }}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16 } }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="absolute left-5 top-5 z-10">
          <Image src="/navIcon.png" alt="Hallos" width={30} height={23} className="object-contain" />
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Close"
        >
          <X size={20} color="rgba(234,234,234,0.7)" />
        </button>

        <div className="relative flex max-h-[calc(100dvh-32px)] flex-col items-center gap-4 overflow-y-auto px-6 pb-8 pt-14 text-center sm:px-10 sm:pb-10">
          <Hero tone={a.tone} />
          <span className="text-white" style={{ fontFamily: 'Tangerine, cursive', fontSize: 'clamp(28px, 5vw, 34px)', fontWeight: 700, lineHeight: 1 }}>
            {EYEBROW[a.tone]}
          </span>
          <h2
            id={titleId}
            className="max-w-[520px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 500, lineHeight: 1.3, color: '#f2f2f2' }}
          >
            {a.title}
          </h2>
          {a.body ? (
            <p className="max-w-[520px] whitespace-pre-line text-sm sm:text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6, color: 'rgba(242,242,242,0.72)' }}>
              {a.body}
            </p>
          ) : null}

          <div className="mt-2 flex w-full flex-col items-center gap-3">
            {a.linkUrl ? (
              <Link
                href={a.linkUrl}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={onClose}
                className="group flex items-center gap-2 rounded-full px-10 py-4 transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
                style={{ background: PRIMARY, boxShadow: '-4px 10px 24px rgba(42,29,122,0.30)' }}
              >
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#ffffff' }}>{a.linkLabel || 'Learn more'}</span>
                <ArrowRight size={16} color="#ffffff" aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-10 py-4 transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
                style={{ background: PRIMARY, boxShadow: '-4px 10px 24px rgba(42,29,122,0.30)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#ffffff' }}
              >
                Got it
              </button>
            )}
            {a.dismissible ? (
              <button
                type="button"
                onClick={() => {
                  onDismiss(a.id);
                  onClose();
                }}
                className="rounded-full px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(242,242,242,0.6)' }}
              >
                Don’t show this again
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
