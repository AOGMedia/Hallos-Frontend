"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  HOW_TO_PAY_NOTE,
  HOW_TO_PAY_STEPS,
  howToJoinSteps,
  whyThisSeriesPoints,
  type InfoPoint,
  type InfoStep,
  type SeriesInfoFacts,
} from "./seriesInfoContent";

type TabKey = "join" | "pay" | "why";

const SWIPE_DISTANCE_PX = 60;
const SWIPE_SPEED_PX = 500;

const tapHaptic = () => {
  try {
    navigator.vibrate?.(8);
  } catch {
    // no haptics on this device
  }
};

function Steps({ steps }: { steps: InfoStep[] }) {
  return (
    <ol>
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-3.5 pb-5 last:pb-0">
          {i < steps.length - 1 && <span aria-hidden className="absolute bottom-1 left-[15.5px] top-9 w-px bg-white/10" />}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/30">
            {i + 1}
          </span>
          <div className="min-w-0 pt-1">
            <h3 className="text-[15px] font-semibold leading-snug text-text-primary">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Points({ points }: { points: InfoPoint[] }) {
  return (
    <ul className="divide-y divide-white/[0.06]">
      {points.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3.5 py-3.5 first:pt-0 last:pb-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-snug text-text-primary">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * How to join / How to pay / Why this series, on the series page. Works like
 * app tabs on phones: a sliding underline, big tap areas and swiping between
 * tabs. How to pay only shows to people who still have to pay.
 */
export function SeriesInfoTabs({ isCreator, ...facts }: SeriesInfoFacts & { isCreator: boolean }) {
  const showPay = !facts.isFree && !facts.hasAccess;
  const tabs: { key: TabKey; label: string }[] = [
    { key: "join", label: "How to join" },
    ...(showPay ? [{ key: "pay" as const, label: "How to pay" }] : []),
    { key: "why", label: "Why this series" },
  ];

  const [selected, setSelected] = useState<TabKey>("join");
  const [direction, setDirection] = useState(1);
  const [canSwipe, setCanSwipe] = useState(false);
  const tabRefs = useRef(new Map<TabKey, HTMLButtonElement>());

  useEffect(() => {
    setCanSwipe(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // How to pay can disappear once we know the viewer already has access.
  const activeIndex = Math.max(
    tabs.findIndex((t) => t.key === selected),
    0
  );
  const active = tabs[activeIndex].key;

  const goTo = (index: number) => {
    const next = tabs[index];
    if (!next || next.key === active) return false;
    setDirection(index > activeIndex ? 1 : -1);
    setSelected(next.key);
    tapHaptic();
    return true;
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const index = (activeIndex + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    goTo(index);
    tabRefs.current.get(tabs[index].key)?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="overflow-hidden rounded-lg bg-background-card">
        <h2 className="sr-only">Joining this series</h2>

        <div role="tablist" aria-label="About joining this series" className="flex border-b border-white/[0.08]">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.key, el);
                  else tabRefs.current.delete(tab.key);
                }}
                id={`series-info-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`series-info-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => goTo(tabs.findIndex((t) => t.key === tab.key))}
                onKeyDown={onTabKeyDown}
                className={`relative h-12 flex-auto touch-manipulation whitespace-nowrap px-2 text-[13px] font-semibold transition-colors active:bg-white/[0.04] sm:text-sm lg:h-14 lg:flex-none lg:px-6 ${
                  isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="series-info-tab-underline"
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary lg:inset-x-4"
                  />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            id={`series-info-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`series-info-tab-${active}`}
            initial={{ opacity: 0, x: direction * 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            // Touch screens only, so desktop users can still select the text.
            drag={canSwipe ? "x" : false}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.x < -SWIPE_DISTANCE_PX || velocity.x < -SWIPE_SPEED_PX) goTo(activeIndex + 1);
              else if (offset.x > SWIPE_DISTANCE_PX || velocity.x > SWIPE_SPEED_PX) goTo(activeIndex - 1);
            }}
            className="p-4 lg:p-6"
          >
            {isCreator && <p className="mb-4 text-xs text-text-muted">This is what people joining your series see.</p>}
            {active === "join" && <Steps steps={howToJoinSteps(facts)} />}
            {active === "pay" && (
              <>
                <Steps steps={HOW_TO_PAY_STEPS} />
                <p className="mt-5 border-t border-white/[0.06] pt-4 text-[13px] leading-relaxed text-text-muted">
                  {HOW_TO_PAY_NOTE}
                </p>
              </>
            )}
            {active === "why" && <Points points={whyThisSeriesPoints(facts)} />}
          </motion.div>
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
