"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, GraduationCap, LayoutGrid, Newspaper } from "lucide-react";
import { NAV_PANEL_CARD, NavMegaPanel, type NavPanelFeature, type NavPanelLink } from "./NavMegaPanel";

/** Everything under the dashboard's "More" menu. Add new destinations here. */
export const MORE_LINKS: NavPanelLink[] = [
  {
    label: "Events",
    description: "Live sessions, cohorts, and community meetups",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "Self-Paced Courses",
    description: "Learn at your own pace with expert-led courses",
    href: "/course",
    icon: GraduationCap,
  },
  {
    label: "Blog",
    description: "Stories, product updates, and ideas from the team",
    href: "/blog",
    icon: Newspaper,
  },
];

/** Brand gradient label and icon chip, so "More" reads as a feature, not plain text. */
const GRADIENT_LABEL = "bg-gradient-to-r from-primary to-accent-cyan bg-clip-text font-semibold text-transparent";
const ICON_CHIP =
  "flex items-center justify-center bg-gradient-to-br from-primary to-accent-cyan text-white shadow-[0_0_14px_-3px_var(--primary)]";

const MORE_FEATURE: NavPanelFeature = {
  eyebrow: "Featured",
  title: "Live sessions run every week",
  text: "See what's coming up next.",
  href: "/dashboard/events",
  cta: "View events",
};

/**
 * The dashboard header's "More" button. Desktop: a dropdown panel under the
 * button. Phones: the same panel as a bottom sheet (swipe down or tap outside
 * to close), rendered on <body> so the header's blur can't clip it.
 */
export function MoreMenu({ variant }: { variant: "mobile" | "desktop" }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => setMounted(true), []);

  // Escape closes; on desktop so does a click outside the panel.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (variant === "desktop" && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, variant]);

  // Phones: the page behind the sheet doesn't scroll.
  useEffect(() => {
    if (!open || variant !== "mobile") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, variant]);

  if (variant === "mobile") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex flex-col items-center gap-1 p-1.5 transition active:scale-95"
        >
          <span className={`${ICON_CHIP} h-7 w-7 rounded-lg`}>
            <LayoutGrid size={15} />
          </span>
          <span className={`${GRADIENT_LABEL} text-[11px]`}>More</span>
        </button>

        {mounted &&
          createPortal(
            <AnimatePresence>
              {open && (
                <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="More">
                  <motion.button
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 340 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.6 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 80 || info.velocity.y > 500) close();
                    }}
                    className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-3xl border-t border-border bg-[#0d0f18] pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-24px_60px_-12px_rgba(0,0,0,0.7)]"
                  >
                    <div className="flex justify-center pt-2.5 pb-1">
                      <span className="h-1 w-10 rounded-full bg-white/20" />
                    </div>
                    <div className="relative">
                      <NavMegaPanel heading="More" links={MORE_LINKS} featured={MORE_FEATURE} onNavigate={close} stacked />
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 transition ${
          open ? "border-primary/50 bg-white/[0.07]" : "border-white/10 bg-white/[0.04] hover:border-primary/40 hover:bg-white/[0.07]"
        }`}
      >
        <span className={`${ICON_CHIP} h-7 w-7 rounded-full`}>
          <LayoutGrid size={14} />
        </span>
        <span className={`${GRADIENT_LABEL} text-sm`}>More</span>
        <ChevronDown size={14} className={`text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute top-full right-0 z-50 mt-3 w-[min(680px,calc(100vw-2.5rem))] ${NAV_PANEL_CARD}`}
          >
            <NavMegaPanel heading="More" links={MORE_LINKS} featured={MORE_FEATURE} onNavigate={close} wide />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
