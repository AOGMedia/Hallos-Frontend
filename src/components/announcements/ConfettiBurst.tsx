'use client';

import { useEffect, useRef } from 'react';

/** Brand palette only (primary, pink from the promo bar, secondary blue, green and yellow accents). */
const COLORS = ['#6a57e5', '#e557c6', '#5099f8', '#14c877', '#ffd42a'];

interface ConfettiBurstProps {
  /** How many pieces. 0 renders nothing. */
  pieces: number;
}

/**
 * A one-off burst of confetti from where it's placed. Each piece is a tiny
 * element moved with the Web Animations API (transform and opacity only, so
 * the GPU does the work) and removed when it lands — no animation loop and
 * nothing left behind. Skipped entirely for people who prefer reduced motion.
 */
export function ConfettiBurst({ pieces }: ConfettiBurstProps) {
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root || pieces <= 0) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const made: HTMLElement[] = [];
    for (let i = 0; i < pieces; i++) {
      const el = document.createElement('i');
      const size = 5 + Math.random() * 5;
      const round = Math.random() < 0.35;
      el.style.cssText = [
        'position:absolute', 'left:0', 'top:0', 'display:block', 'pointer-events:none', 'will-change:transform,opacity',
        `width:${size}px`, `height:${round ? size : size * 0.45}px`,
        `background:${COLORS[i % COLORS.length]}`, `border-radius:${round ? '50%' : '1px'}`,
      ].join(';');
      root.appendChild(el);
      made.push(el);

      // Fan out upwards and sideways, then fall with a little drift and spin.
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 70 + Math.random() * 110;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const fall = 90 + Math.random() * 80;
      const spin = (Math.random() - 0.5) * 900;
      const duration = 1100 + Math.random() * 700;
      el.animate(
        [
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${spin * 0.5}deg) scale(1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${dx * 1.25}px, ${dy + fall}px) rotate(${spin}deg) scale(0.9)`, opacity: 0 },
        ],
        { duration, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', delay: Math.random() * 120, fill: 'forwards' }
      ).finished.then(() => el.remove()).catch(() => el.remove());
    }
    return () => made.forEach((el) => el.remove());
  }, [pieces]);

  return <span ref={host} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10 block h-0 w-0" />;
}
