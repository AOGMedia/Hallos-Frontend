'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquareText, Plus, SquarePen, type LucideIcon } from 'lucide-react';

interface QuickAction {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Solid brand styling for the action's icon tile. */
  tile: string;
  run: () => void;
}

const tap = () => {
  try {
    navigator.vibrate?.(10);
  } catch {
    // no haptics on this device
  }
};

/**
 * The floating button at the bottom-right of the dashboard. Tap it and the
 * quick actions fan out above it (Create, Share feedback); tap outside, the
 * ×, or press Escape to close. Flat brand colours only; only transform and
 * opacity animate, so it stays smooth on phones.
 */
export function QuickActionsButton({ onFeedback }: { onFeedback: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const actions: QuickAction[] = [
    // No "Create" on the create page itself.
    ...(pathname?.startsWith('/dashboard/create')
      ? []
      : [
          {
            key: 'create',
            label: 'Create',
            hint: 'Upload a video or go live',
            icon: SquarePen,
            tile: 'bg-primary text-white',
            run: () => router.push('/dashboard/create'),
          },
        ]),
    {
      key: 'feedback',
      label: 'Share feedback',
      hint: 'Tell us what to improve',
      icon: MessageSquareText,
      tile: 'bg-primary/15 text-primary ring-1 ring-primary/30',
      run: onFeedback,
    },
  ];

  const choose = (action: QuickAction) => {
    tap();
    setOpen(false);
    action.run();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close quick actions"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 cursor-default bg-black/55"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[max(env(safe-area-inset-bottom),24px)] right-5 z-40 flex flex-col items-end gap-3 sm:right-6">
        <AnimatePresence>
          {open &&
            actions.map((action, i) => {
              const Icon = action.icon;
              // The action nearest the main button appears first.
              const order = actions.length - 1 - i;
              return (
                <motion.button
                  key={action.key}
                  type="button"
                  onClick={() => choose(action)}
                  initial={{ opacity: 0, y: 16, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, delay: order * 0.05, ease: 'easeOut' } }}
                  exit={{ opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.12 } }}
                  className="flex min-w-[230px] touch-manipulation items-center gap-3 rounded-2xl border border-white/10 bg-[#1F2636] py-2.5 pl-2.5 pr-5 text-left shadow-[0_12px_28px_-10px_rgba(0,0,0,0.8)] transition hover:border-primary/40 active:scale-[0.97]"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.tile}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-tight text-white">{action.label}</span>
                    <span className="mt-0.5 block text-xs leading-tight text-white/55">{action.hint}</span>
                  </span>
                </motion.button>
              );
            })}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => {
            tap();
            setOpen((v) => !v);
          }}
          aria-label={open ? 'Close quick actions' : 'Quick actions'}
          aria-expanded={open}
          className={`flex h-14 w-14 touch-manipulation items-center justify-center rounded-full text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,0.8)] ring-4 transition active:scale-90 ${
            open ? 'bg-[#1F2636] ring-white/10' : 'bg-primary ring-primary/20 hover:bg-primary/90'
          }`}
        >
          <Plus className={`h-6 w-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </>
  );
}
