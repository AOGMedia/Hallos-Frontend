'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { DEMO_STEPS } from './demoSteps';
import { DEMO_SCREENS } from './DemoScreens';

/**
 * Auto-playing walkthrough of how the quiz works: a phone showing each step,
 * with the steps listed alongside (tap one to jump to it).
 *
 * Light by design: the active step's progress bar is a CSS animation, and its
 * end is what moves the demo on, so there are no JS timers. It only plays
 * while it's on screen and the tab is visible, and has a Pause button.
 * People who prefer reduced motion get fades instead of slides.
 */
export function QuizDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);

    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const playing = inView && pageVisible && !paused;
  const step = DEMO_STEPS[index];
  const Screen = DEMO_SCREENS[step.id];
  const next = () => setIndex((i) => (i + 1) % DEMO_STEPS.length);

  return (
    <MotionConfig reducedMotion="user">
      <style>{`@keyframes hallos-demo-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
      <div
        ref={rootRef}
        className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16"
      >
        {/* Phone (first on small screens, right on large ones) */}
        <div className="mx-auto w-full max-w-[340px] lg:order-2">
          <div
            role="img"
            aria-label={`Demo: ${step.title}. ${step.text}`}
            className="relative h-[520px] overflow-hidden rounded-[40px] border border-white/10 bg-[#141a29] p-2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)]"
          >
            <div className="relative h-full overflow-hidden rounded-[32px] bg-[#1A2030] pt-3">
              {/* Notch */}
              <div aria-hidden className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/15" />
              {/* Screens cross-fade (old and new overlap) so there's never a blank frame. */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={step.id}
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 top-6 will-change-transform"
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } }}
                  exit={{ opacity: 0, x: -28, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } }}
                >
                  <Screen />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol className="flex flex-col gap-2 lg:order-1">
          {DEMO_STEPS.map((s, i) => {
            const active = i === index;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={active ? 'step' : undefined}
                  className={`relative w-full touch-manipulation overflow-hidden rounded-2xl p-4 text-left transition-colors sm:p-5 ${
                    active ? 'bg-[#1F2636]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        active ? 'bg-primary text-white' : 'bg-white/[0.06] text-white/50'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-base font-semibold sm:text-lg ${active ? 'text-white' : 'text-white/60'}`}>{s.title}</p>
                      {/* Only the active step's detail is shown, so the list stays short on phones. */}
                      {active && <p className="mt-1 text-sm leading-relaxed text-text-muted">{s.text}</p>}
                    </div>
                  </div>
                  {active && (
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-white/[0.06]">
                      <span
                        key={index}
                        onAnimationEnd={next}
                        className="block h-full origin-left bg-primary"
                        style={{
                          animation: `hallos-demo-fill ${s.durationMs}ms linear forwards`,
                          animationPlayState: playing ? 'running' : 'paused',
                        }}
                      />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          <li className="pl-4 pt-1">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
              {paused ? 'Play demo' : 'Pause demo'}
            </button>
          </li>
        </ol>
      </div>
    </MotionConfig>
  );
}
