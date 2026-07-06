'use client';

import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
}

export function VideoPlayButton({ isPlaying, onPlay }: VideoPlayButtonProps) {
  return (
    <AnimatePresence>
      {!isPlaying && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="w-20 h-20 rounded-full bg-primary backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 pointer-events-auto"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
