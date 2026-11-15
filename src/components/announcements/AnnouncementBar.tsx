'use client';

import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from 'framer-motion';
import { ArrowRight, Megaphone, TriangleAlert, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnnouncementModal } from './AnnouncementModal';
import { ConfettiBurst } from './ConfettiBurst';
import './announcements.css';
import { type Announcement, readList, writeList } from './useAnnouncements';

const CELEBRATED_KEY = 'hallos:celebrated-announcements';

/** Same surface as the promo bar (components/promo/PromoCompactBanner), so announcements feel part of the family. */
const BANNER_BG = 'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), #ffffff';
const INK = '#2d1b8a';
const PRIMARY = '#6a57e5';

/** Settles without overshoot: fast at first, then a long gentle finish. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

/**
 * Only good news is a celebration. `success` (offers, wins) gets the promo
 * artwork and a confetti burst the first time it's seen; `info` (news,
 * updates) and `warning` (heads-up notices) stay alive with a steady signal
 * ring instead, and never throw confetti.
 */
const CONFETTI = { success: 36, info: 0, warning: 0 } as const;

/** How far a swipe has to travel (px) before it changes slides. */
const SWIPE = 48;

/**
 * How long a slide stays: enough to read it comfortably (~215 words a
 * minute, plus a moment to take in the picture), never under 6s, never over 12s.
 */
const dwellFor = (a: Announcement) => {
  const words = `${a.title} ${a.body ?? ''}`.trim().split(/\s+/).length;
  return Math.min(12000, Math.max(6000, 2500 + words * 280));
};

/*
 * Slide choreography. The card never moves; only its contents change.
 * Leaving: everything drifts a little the way we're going and fades, together and quickly.
 * Arriving: icon, text, button and close come in one after another (a short
 * cascade), each gliding a few pixels and settling. `custom` is the
 * direction: 1 next, -1 previous, 0 arriving or after a close (rise instead).
 */
const slideVariants: Variants = {
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
  out: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  gone: { opacity: 0, transition: { duration: 0.2, ease: EASE_IN } },
};
const makeItem = (reduce: boolean, travel: number): Variants => ({
  show: (dir: number) =>
    reduce
      ? { opacity: 1, x: 0, y: 0, transition: { duration: 0.3 } }
      : dir === 0
        ? { opacity: [0, 1], x: 0, y: [8, 0], transition: { duration: 0.5, ease: EASE_OUT } }
        : { opacity: [0, 1], x: [dir * travel, 0], y: 0, transition: { duration: 0.6, ease: EASE_OUT, opacity: { duration: 0.4, ease: 'linear' } } },
  out: (dir: number) =>
    reduce
      ? { opacity: 0, transition: { duration: 0.2 } }
      : { opacity: 0, x: dir === 0 ? 0 : dir * -(travel * 0.5), y: 0, transition: { duration: 0.22, ease: EASE_IN } },
});
const makeIcon = (reduce: boolean): Variants => ({
  show: (dir: number) =>
    reduce
      ? { opacity: 1, scale: 1, transition: { duration: 0.3 } }
      : { opacity: [0, 1], scale: [0.72, 1], x: dir === 0 ? 0 : [dir * 10, 0], transition: { type: 'spring', stiffness: 420, damping: 24, opacity: { duration: 0.25 } } },
  out: (dir: number) => (reduce ? { opacity: 0, transition: { duration: 0.2 } } : { opacity: 0, scale: 0.85, x: dir * -6, transition: { duration: 0.2, ease: EASE_IN } }),
});

/**
 * The promo artwork for good news (the same illustrations the promo modal
 * uses). As the slide arrives the parachute drops in and settles, then sways;
 * coins and the percent sign float. Each piece sits in a parallax wrapper that
 * follows the pointer slightly. Positioned against the card.
 */
function Artwork({ tone, reduce }: { tone: Announcement['tone']; reduce: boolean }) {
  if (tone !== 'success') return null; // gifts and coins are for celebrations only
  const drop: Variants = {
    show: reduce ? { opacity: 1 } : { y: [-40, 0], rotate: [-12, 0], opacity: [0, 1], transition: { type: 'spring', stiffness: 70, damping: 12, delay: 0.25 } },
    out: { opacity: 0, transition: { duration: 0.2 } },
  };
  const fade: Variants = { show: { opacity: [0, 1], transition: { duration: 0.6, delay: 0.3 } }, out: { opacity: 0, transition: { duration: 0.2 } } };
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className="announce-parallax absolute right-[24%] top-0 hidden md:block" style={{ ['--depth' as string]: 7 }}>
        <motion.span className="block" variants={drop}>
          <Image src="/images/promo-parachute.png" alt="" width={36} height={36} sizes="36px" className="announce-parachute" />
        </motion.span>
      </span>
      <motion.span variants={fade} className="announce-parallax absolute -bottom-1 right-[37%] hidden lg:block" style={{ ['--depth' as string]: 11 }}>
        <Image src="/images/promo-coins.png" alt="" width={26} height={26} sizes="26px" className="announce-coins" />
      </motion.span>
      <motion.span variants={fade} className="announce-parallax absolute -bottom-3 right-[48%] hidden lg:block" style={{ ['--depth' as string]: 4 }}>
        <Image src="/images/promo-percent.png" alt="" width={30} height={30} sizes="30px" className="announce-percent opacity-80" />
      </motion.span>
    </span>
  );
}

function ToneIcon({ tone }: { tone: Announcement['tone'] }) {
  if (tone === 'success') {
    return <Image src="/images/promo-gift.png" width={44} height={44} sizes="44px" alt="" aria-hidden className="announce-gift h-10 w-10 object-contain sm:h-11 sm:w-11" />;
  }
  const warning = tone === 'warning';
  const fill = warning ? '#ffd42a' : PRIMARY;
  // Not a celebration: a steady ring spreads from the icon, like a live signal.
  // News pulses at a relaxed pace; heads-up notices pulse a little slower and stay still otherwise.
  return (
    <span className="relative flex h-10 w-10 sm:h-11 sm:w-11">
      <span aria-hidden className={`absolute inset-0 rounded-full ${warning ? 'announce-ring announce-ring-slow' : 'announce-ring'}`} style={{ background: fill }} />
      <span
        className="relative flex h-full w-full items-center justify-center rounded-full"
        style={{ background: fill, boxShadow: '-2.35px 5.88px 14.12px rgba(42,29,122,0.30)' }}
      >
        {warning ? <TriangleAlert size={19} color={INK} aria-hidden /> : <Megaphone size={18} color="#ffffff" aria-hidden className="announce-wiggle" />}
      </span>
    </span>
  );
}

/**
 * One dot per announcement. The active one stretches into a pill that fills
 * in step with the slideshow clock (same duration, delay and pauses), so
 * people can see the next change coming. It's only the picture of the clock.
 */
function Dots({ total, active, paused, onPick, slideKey, duration, delay }: { total: number; active: number; paused: boolean; onPick: (i: number) => void; slideKey: string; duration: number; delay: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Show announcement ${i + 1} of ${total}`}
          aria-current={i === active ? 'true' : undefined}
          className="flex h-4 items-center"
        >
          <span
            className="relative block h-1 overflow-hidden rounded-full transition-[width] duration-500 ease-out"
            style={{ width: i === active ? 18 : 6, background: 'rgba(106,87,229,0.25)' }}
          >
            {i === active ? (
              <span
                key={slideKey}
                className="announce-progress absolute inset-0 rounded-full"
                style={{ background: PRIMARY, animationDuration: `${duration}ms`, animationDelay: `${delay}ms`, animationPlayState: paused ? 'paused' : 'running' }}
              />
            ) : null}
          </span>
        </button>
      ))}
    </span>
  );
}

interface SlideProps {
  a: Announcement;
  active: boolean;
  dir: number;
  reduce: boolean;
  onOpen: (a: Announcement) => void;
  onClose: (id: string) => void;
}

/** One announcement's contents. All slides share one grid cell, so the card is as tall as the tallest and never jumps. */
function Slide({ a, active, dir, reduce, onOpen, onClose }: SlideProps) {
  const external = a.linkUrl?.startsWith('http');
  const item = makeItem(reduce, 22);
  const icon = makeIcon(reduce);
  return (
    <motion.div
      data-active={active}
      aria-hidden={!active}
      inert={!active}
      custom={dir}
      variants={slideVariants}
      initial="out"
      animate={active ? 'show' : 'out'}
      exit="gone"
      className={`col-start-1 row-start-1 flex min-w-0 items-center gap-3 sm:gap-4 ${active ? '' : 'pointer-events-none'}`}
    >
      <Artwork tone={a.tone} reduce={reduce} />

      <motion.div className="relative shrink-0" variants={icon} custom={dir}>
        <ToneIcon tone={a.tone} />
      </motion.div>

      <motion.div className="relative min-w-0 flex-1" variants={item} custom={dir}>
        <button
          type="button"
          onClick={() => onOpen(a)}
          aria-haspopup="dialog"
          aria-label={`Open announcement: ${a.title}`}
          className="group/open block w-full min-w-0 cursor-pointer rounded-md text-left outline-offset-2"
        >
          <span
            className="line-clamp-2 min-w-0 text-sm leading-snug decoration-[#6a57e5]/50 underline-offset-4 group-hover/open:underline sm:block sm:truncate sm:text-base"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, color: INK }}
          >
            {a.title}
          </span>
          {a.body ? (
            <span className="mt-0.5 line-clamp-1 text-xs sm:line-clamp-2 sm:text-sm" style={{ color: '#4b4470', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {a.body}
            </span>
          ) : null}
        </button>
      </motion.div>

      {a.linkUrl ? (
        <motion.div className="relative shrink-0" variants={item} custom={dir}>
          <Link
            href={a.linkUrl}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            draggable={false}
            // Phones: a round arrow button, so the title gets the room. Larger screens: the full pill.
            aria-label={a.linkLabel || 'Learn more'}
            className="group flex h-9 w-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
            style={{ background: PRIMARY, boxShadow: '-2.35px 5.88px 14.12px rgba(42,29,122,0.30)' }}
          >
            <span className="hidden text-xs font-bold text-white sm:inline" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {a.linkLabel || 'Learn more'}
            </span>
            <ArrowRight size={14} color="#ffffff" aria-hidden className="announce-arrow transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      ) : null}

      {a.dismissible ? (
        <motion.div className="relative shrink-0" variants={item} custom={dir}>
          <button
            type="button"
            onClick={() => onClose(a.id)}
            aria-label="Close announcement"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 active:scale-90"
          >
            <X size={18} color="#888c94" />
          </button>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

interface AnnouncementBarProps {
  /** What this person should see, newest first, without the ones they closed. */
  items: Announcement[];
  onDismiss: (id: string) => void;
}

/**
 * Announcements staff publish from the admin, in the promo bar's style. With
 * more than one, it becomes a slideshow: each stays long enough to read
 * (6-12s), paused while the mouse is over it, a control has keyboard focus,
 * its popup is open or the tab is hidden. The card itself stays still and its
 * contents change in a short cascade; dots show where you are and can be
 * tapped, and phones can swipe. Good news gets the brand artwork and
 * confetti the first time it's seen; news and notices keep a steady signal
 * ring. Tapping the text opens the full announcement.
 *
 * Performance: transform and opacity only (GPU-composited), one JS timer for
 * the slideshow (the filling dot is CSS), the parallax writes two CSS
 * variables without re-rendering, and confetti pieces remove themselves.
 * With reduced motion (including Windows with animation effects off) the
 * decoration stops and slides simply cross-fade, but the slideshow still moves on.
 */
export function AnnouncementBar({ items, onDismiss }: AnnouncementBarProps) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  // 1 = next, -1 = previous, 0 = arriving or after a close.
  const [direction, setDirection] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  // The full announcement in the promo-style modal, opened by tapping the bar.
  const [detail, setDetail] = useState<Announcement | null>(null);
  const closeDetail = useCallback(() => setDetail(null), []);
  // Don't let the clock run while nobody can see it (coming back to the tab shouldn't skip ahead).
  const [pageHidden, setPageHidden] = useState(false);
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  const card = useRef<HTMLDivElement>(null);

  const count = items.length;
  const position = count ? index % count : 0;
  const current = count ? items[position] : null;
  const many = count > 1;

  const go = (to: number, dir: number) => {
    if (!many) return;
    setCelebrate(null); // a burst belongs to its first showing, not to the slide coming round again
    setFocused(false); // the focused control leaves with the old slide
    setDirection(dir);
    setIndex(((to % count) + count) % count);
  };

  // The slideshow clock. A JS timer keeps exact time and remembers what was
  // left when it pauses; the filling dot only shows it.
  const paused = hovered || focused || detail !== null || pageHidden;
  const dwell = current ? dwellFor(current) : 0;
  // It starts once the slide has settled: longer on arrival (entrance, confetti), shorter after a change.
  const settle = direction === 0 ? 1100 : 700;
  const advance = useRef(() => {});
  useEffect(() => {
    advance.current = () => go(position + 1, 1);
  });
  const clock = useRef<{ id: string | null; left: number }>({ id: null, left: 0 });
  useEffect(() => {
    if (!many || !current) return;
    if (clock.current.id !== current.id) clock.current = { id: current.id, left: dwell + settle };
    if (paused) return;
    const started = performance.now();
    const timer = window.setTimeout(() => advance.current(), clock.current.left);
    return () => {
      window.clearTimeout(timer);
      clock.current.left = Math.max(0, clock.current.left - (performance.now() - started));
    };
  }, [many, current, paused, dwell, settle]);

  // Celebrate once per announcement per device, once it has landed.
  useEffect(() => {
    if (!current || CONFETTI[current.tone] === 0) return;
    if (readList(CELEBRATED_KEY).includes(current.id)) return;
    // Mark it celebrated only when the burst actually fires, so a cancelled
    // timer (fast slide change, React re-running effects) doesn't use it up.
    const t = window.setTimeout(() => {
      writeList(CELEBRATED_KEY, [...readList(CELEBRATED_KEY), current.id]);
      setCelebrate(current.id);
    }, 420);
    return () => window.clearTimeout(t);
  }, [current]);

  // Pointer parallax: two CSS variables, no re-renders. Mouse and pen only.
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType === 'touch' || !card.current) return;
    const rect = card.current.getBoundingClientRect();
    card.current.style.setProperty('--mx', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    card.current.style.setProperty('--my', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };
  const onPointerLeave = () => {
    card.current?.style.setProperty('--mx', '0');
    card.current?.style.setProperty('--my', '0');
    setHovered(false);
  };

  // A swipe that ends over the link or the close button must not also click it.
  const dragged = useRef(false);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    window.setTimeout(() => (dragged.current = false), 0);
    if (info.offset.x <= -SWIPE) go(position + 1, 1);
    else if (info.offset.x >= SWIPE) go(position - 1, -1);
  };

  const close = (id: string) => {
    setCelebrate(null);
    setFocused(false);
    setDirection(0);
    onDismiss(id); // the next one rises into place
  };

  return (
    <>
      <AnimatePresence initial>
        {current ? (
          <motion.div
            key="announcements"
            // The bar unfolds from the header when the first one arrives and folds away after the last.
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, scaleY: 0.82 }}
            animate={{ opacity: 1, y: 0, scaleY: 1, transition: reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 340, damping: 28 } }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scaleY: 0.9, transition: { duration: 0.2, ease: EASE_IN } }}
            style={{ transformOrigin: 'top center' }}
            className="relative mx-2 my-2 lg:mx-10"
            drag={many && !reduce ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            dragSnapToOrigin
            onDragStart={() => (dragged.current = true)}
            onDragEnd={onDragEnd}
            onClickCapture={(e) => {
              if (!dragged.current) return;
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div
              ref={card}
              role={many ? 'region' : 'status'}
              aria-roledescription={many ? 'carousel' : undefined}
              aria-label={many ? 'Announcements' : undefined}
              // A rotating bar shouldn't read itself out every few seconds; a single one is announced once.
              aria-live={many ? 'off' : 'polite'}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              // Pause for keyboard focus only: a mouse click also focuses the button it hits,
              // and that must not stop the slideshow for good.
              onFocus={(e) => (e.target as HTMLElement).matches?.(':focus-visible') && setFocused(true)}
              onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocused(false)}
              className={`relative overflow-hidden rounded-[14px] border px-3 pt-2.5 sm:px-4 sm:pt-3 ${many ? 'pb-5 sm:pb-6' : 'pb-2.5 sm:pb-3'}`}
              style={{ background: BANNER_BG, minHeight: 64, borderColor: 'rgba(106,87,229,0.18)', boxShadow: '0 10px 28px -16px rgba(42,29,122,0.55)' }}
            >
              {current.tone !== 'warning' ? <span aria-hidden className="announce-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3" /> : null}

              <div className="grid min-h-[40px] items-center sm:min-h-[44px]">
                <AnimatePresence initial={false}>
                  {items.map((a, i) => (
                    <Slide key={a.id} a={a} active={i === position} dir={direction} reduce={reduce} onOpen={setDetail} onClose={close} />
                  ))}
                </AnimatePresence>
              </div>

              {many ? (
                // Lined up with the text; stays put while the slides change.
                <span className="absolute bottom-1 left-[64px] sm:bottom-1.5 sm:left-[76px]">
                  <Dots total={count} active={position} paused={paused} duration={dwell} delay={settle} slideKey={current.id} onPick={(i) => i !== position && go(i, i > position ? 1 : -1)} />
                </span>
              ) : null}
            </div>

            {/* Outside the card (which clips), over the icon, so the burst can fly past the edges. */}
            {celebrate === current.id ? (
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3 z-10 w-10 sm:left-4 sm:w-11">
                <ConfettiBurst pieces={CONFETTI[current.tone]} />
              </span>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {detail ? <AnnouncementModal key={detail.id} announcement={detail} onClose={closeDetail} onDismiss={close} /> : null}
      </AnimatePresence>
    </>
  );
}
