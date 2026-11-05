"use client";

import { memo, useEffect, useRef, useState } from "react";

const FIRST_PASS_MS = 8_000;
const EVERY_MS = 5 * 60_000;
/** Longest pass is 20s; clears the pass even if animationend never fires. */
const SAFETY_MS = 22_000;

/** The Hallos "H" mark, inlined so it needs no download. */
const H_MARK =
  "M0.0008,0.3258l1.2392,17.8097c0.0089,0.126 0.1115,0.2253 0.2379,0.2294l6.1712,0.2078l2.6037,0.0881c0.1461,0.0049 0.2647,-0.1178 0.2547,-0.264l-0.4707,-6.7626l0.0067,0.0011l7.4367,1.466c0.283,0.0558 0.2569,0.4685 -0.0305,0.4885l-4.8189,0.3354c-0.136,0.0093 -0.2387,0.1275 -0.229,0.2632l0.3015,4.3326c0.009,0.1261 0.1116,0.2253 0.238,0.2294l3.9623,0.1346l2.1925,0.0748l2.5825,0.087c0.0086,0 0.0171,0 0.0253,-0.0004c0.1357,-0.0093 0.2383,-0.1272 0.229,-0.2633l-0.5428,-7.9375l-0.2346,-3.4165l-0.4454,-6.5166c-0.0086,-0.1264 -0.1116,-0.2257 -0.238,-0.2297l-8.7581,-0.2956c-0.1461,-0.0049 -0.2648,0.1178 -0.2547,0.264l0.4432,6.3663c0.0111,0.1621 -0.1346,0.2908 -0.2941,0.2592l-7.1271,-1.4036c-0.2829,-0.0558 -0.2569,-0.4685 0.0305,-0.4885l4.8189,-0.3354c0.1361,-0.0093 0.2387,-0.1275 0.2291,-0.2632l-0.2964,-4.2609c-0.0089,-0.126 -0.1115,-0.2253 -0.2379,-0.2294l-8.7689,-0.2956c-0.1376,-0.0044 -0.2521,0.1038 -0.2551,0.2413l-0.0015,0.0614c0,0.0074 0,0.0149 0.0004,0.0223z";

function Mark() {
  return (
    <>
      <svg viewBox="0 0 21.9335 19.0468" className="h-4 w-4 shrink-0 md:h-5 md:w-5">
        <path d={H_MARK} fill="currentColor" />
      </svg>
      <span className="whitespace-nowrap text-[14px] font-extrabold uppercase tracking-[0.42em] md:text-[17px] md:tracking-[0.55em]">
        Hallos Live
      </span>
      <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-70" />
      <span className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.32em] opacity-80 md:text-[14px] md:tracking-[0.42em]">
        Learn Live, from the Best
      </span>
    </>
  );
}

/**
 * "Hallos Live" drifting across the top bar now and then, behind the title
 * and badges: once shortly after joining, then every few minutes. It only
 * exists in the DOM while a pass runs, and a pass is skipped while the bar is
 * hidden (phones) or the tab isn't visible.
 */
export const BrandGlide = memo(function BrandGlide({ paused }: { paused: boolean }) {
  const [pass, setPass] = useState<number | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const run = () => {
      if (pausedRef.current || document.hidden) return;
      setPass(Date.now());
    };
    const first = setTimeout(run, FIRST_PASS_MS);
    const every = setInterval(run, EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);

  useEffect(() => {
    if (pass === null) return;
    const t = setTimeout(() => setPass(null), SAFETY_MS);
    return () => clearTimeout(t);
  }, [pass]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {pass !== null && (
        <div
          key={pass}
          className="hallos-glide absolute inset-0 flex items-center"
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) setPass(null);
          }}
        >
          <div className="hallos-glide-track relative flex w-max shrink-0 items-center">
            <span className="hallos-glide-glow" />
            <span className="hallos-glide-trail" />
            <div className="hallos-glide-mark relative flex items-center gap-2.5 md:gap-3.5">
              <Mark />
              <div className="hallos-glide-glint absolute inset-0 flex items-center gap-2.5 md:gap-3.5">
                <Mark />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
