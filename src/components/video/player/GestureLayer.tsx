'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, RotateCw } from 'lucide-react';

interface GestureLayerProps {
  /** Touch: one tap shows/hides the controls. Mouse: one click plays/pauses. */
  onTap: (pointer: 'touch' | 'mouse') => void;
  /** Double tap on the left/right half skips back/forward (touch); double click toggles full screen (mouse). */
  onDoubleTap: (side: 'left' | 'right', pointer: 'touch' | 'mouse') => void;
}

const DOUBLE_TAP_MS = 280;

/** Catches taps on the video itself (buttons sit above it and keep their own clicks). */
export function GestureLayer({ onTap, onDoubleTap }: GestureLayerProps) {
  const last = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ripple, setRipple] = useState<{ side: 'left' | 'right'; key: number } | null>(null);

  return (
    <div
      className="absolute inset-0 z-[5]"
      onPointerUp={(e) => {
        const pointer = e.pointerType === 'mouse' ? 'mouse' : 'touch';
        const rect = e.currentTarget.getBoundingClientRect();
        const side = e.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
        const now = Date.now();
        const isDouble = now - last.current < DOUBLE_TAP_MS;
        last.current = isDouble ? 0 : now;

        if (pointer === 'mouse') {
          // Like YouTube: a click plays/pauses at once; a double click is full screen.
          if (isDouble) onDoubleTap(side, pointer);
          else onTap(pointer);
          return;
        }
        if (isDouble) {
          if (timer.current) clearTimeout(timer.current);
          onDoubleTap(side, pointer);
          setRipple({ side, key: now });
          return;
        }
        // Wait a moment: a second tap means "skip", not "show controls".
        timer.current = setTimeout(() => onTap(pointer), DOUBLE_TAP_MS);
      }}
    >
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.key}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onAnimationComplete={() => setRipple(null)}
            className={`pointer-events-none absolute inset-y-0 flex w-1/2 items-center justify-center bg-white/10 ${ripple.side === 'left' ? 'left-0 rounded-r-[50%]' : 'right-0 rounded-l-[50%]'}`}
          >
            <span className="flex flex-col items-center gap-1 text-xs font-semibold text-white">
              {ripple.side === 'left' ? <RotateCcw className="h-6 w-6" /> : <RotateCw className="h-6 w-6" />}
              10 seconds
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
