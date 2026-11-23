'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronLeft, ChevronRight, Gauge, SlidersHorizontal } from 'lucide-react';
import type { QualityLevel } from './usePlayer';

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const speedLabel = (s: number) => (s === 1 ? 'Normal' : `${s}x`);

interface SettingsMenuProps {
  open: boolean;
  onClose: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  levels: QualityLevel[];
  level: number;
  activeHeight: number | null;
  onLevel: (index: number) => void;
  /** Phones: a bottom sheet; larger screens: a panel above the gear. */
  sheet: boolean;
}

/** YouTube-style settings: a short list, each opening its own choices. */
export function SettingsMenu({ open, onClose, speed, onSpeed, levels, level, activeHeight, onLevel, sheet }: SettingsMenuProps) {
  const [view, setView] = useState<'main' | 'speed' | 'quality'>('main');
  useEffect(() => { if (open) setView('main'); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  const qualityLabel = level === -1 ? `Auto${activeHeight ? ` (${activeHeight}p)` : ''}` : `${levels.find((l) => l.index === level)?.height ?? ''}p`;
  const row = 'flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10';

  const body =
    view === 'main' ? (
      <>
        <button type="button" className={row} onClick={() => setView('speed')}>
          <Gauge className="h-5 w-5 text-white/70" aria-hidden />
          <span className="flex-1">Playback speed</span>
          <span className="text-white/60">{speedLabel(speed)}</span>
          <ChevronRight className="h-4 w-4 text-white/50" aria-hidden />
        </button>
        {levels.length > 1 && (
          <button type="button" className={row} onClick={() => setView('quality')}>
            <SlidersHorizontal className="h-5 w-5 text-white/70" aria-hidden />
            <span className="flex-1">Quality</span>
            <span className="text-white/60">{qualityLabel}</span>
            <ChevronRight className="h-4 w-4 text-white/50" aria-hidden />
          </button>
        )}
      </>
    ) : (
      <>
        <button type="button" className={`${row} border-b border-white/10 font-semibold`} onClick={() => setView('main')}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> {view === 'speed' ? 'Playback speed' : 'Quality'}
        </button>
        <div className="max-h-64 overflow-y-auto overscroll-contain">
          {(view === 'speed'
            ? SPEEDS.map((s) => ({ key: String(s), label: speedLabel(s), active: s === speed, pick: () => onSpeed(s) }))
            : [{ index: -1, height: 0 }, ...levels].map((l) => ({
                key: String(l.index),
                label: l.index === -1 ? `Auto${activeHeight ? ` (${activeHeight}p)` : ''}` : `${l.height}p${l.height >= 1080 ? ' HD' : ''}`,
                active: l.index === level,
                pick: () => onLevel(l.index),
              }))
          ).map((o) => (
            <button key={o.key} type="button" className={row} onClick={() => { o.pick(); onClose(); }}>
              <span className="w-5">{o.active && <Check className="h-4 w-4 text-primary" aria-hidden />}</span>
              <span className="flex-1">{o.label}</span>
            </button>
          ))}
        </div>
      </>
    );

  // The phone sheet goes to <body>: inside the pinned player it would sit
  // under the page's floating buttons whatever its z-index.
  return sheet ? createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-end bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Video settings"
        className="w-full rounded-t-3xl bg-[#1F2636] pb-[max(env(safe-area-inset-bottom),12px)] pt-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/25" aria-hidden />
        {body}
      </div>
    </div>,
    document.body
  ) : (
    <div
      role="dialog"
      aria-label="Video settings"
      className="absolute bottom-14 right-3 z-30 w-72 overflow-hidden rounded-xl bg-black/90 py-1 shadow-2xl backdrop-blur"
      onClick={(e) => e.stopPropagation()}
    >
      {body}
    </div>
  );
}
