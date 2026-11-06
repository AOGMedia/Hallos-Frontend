"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface NavPanelLink {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

export interface NavPanelFeature {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
}

/** Desktop dropdown surface for the panel (position it with the parent). */
export const NAV_PANEL_CARD =
  "rounded-2xl border border-border bg-[#0d0f18]/95 backdrop-blur-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] overflow-hidden";

/**
 * The links-plus-featured panel used by the site's "Company" menu and the
 * dashboard's "More" menu. Just the content: the caller decides whether it
 * sits in a dropdown (desktop) or a bottom sheet (phones).
 */
export function NavMegaPanel({
  heading,
  links,
  featured,
  onNavigate,
  stacked = false,
  wide = false,
}: {
  heading: string;
  links: NavPanelLink[];
  featured?: NavPanelFeature;
  /** Called when any link is followed, to close the menu. */
  onNavigate?: () => void;
  /** Always one column (bottom sheet); otherwise side by side when there's room. */
  stacked?: boolean;
  /** Wide dropdown: links in two columns, so more items widen the panel instead of lengthening it. */
  wide?: boolean;
}) {
  return (
    <>
      {/* Ambient accent glow — signals "crafted" rather than a plain list */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
      />

      <div
        className={`relative flex flex-col ${stacked ? "" : "min-[380px]:grid min-[380px]:grid-cols-[1fr_auto]"}`}
      >
        {/* Link column */}
        <div className="p-3">
          <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/70">
            {heading}
          </p>
          <div className={wide && !stacked ? "grid grid-cols-1 gap-1 sm:grid-cols-2" : "flex flex-col gap-1"}>
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="group flex items-start gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 border border-border text-accent-cyan transition-colors group-hover:bg-accent-cyan/10 group-hover:border-accent-cyan/30">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="flex items-center gap-1.5 text-[15px] font-semibold text-text-primary">
                      {item.label}
                      <ArrowUpRight
                        size={14}
                        className="text-text-secondary/50 opacity-0 -translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </span>
                    <span className="block text-[13px] leading-snug text-text-secondary/80 mt-0.5">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Highlight rail — gives the wider surface real content
            instead of stretching a few links across empty space */}
        {featured && (
          <div
            className={`border-t border-border bg-white/[0.02] p-4 flex flex-col justify-between ${
              stacked
                ? ""
                : `${wide ? "min-[380px]:w-[200px]" : "min-[380px]:w-[168px]"} min-[380px]:border-t-0 min-[380px]:border-l`
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/70 mb-2">
                {featured.eyebrow}
              </p>
              <p className="text-[13px] leading-snug text-text-primary font-medium">{featured.title}</p>
              <p className="text-[12px] leading-snug text-text-secondary/70 mt-1">{featured.text}</p>
            </div>
            <Link
              href={featured.href}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-cyan hover:underline mt-4"
            >
              {featured.cta} <ArrowUpRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
