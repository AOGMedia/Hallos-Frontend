'use client';

import { Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoShareModalProps {
  isOpen: boolean;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
}

export function VideoShareModal({ isOpen, copied, onClose, onCopy }: VideoShareModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-20 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm mx-4 rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-semibold">Share</span>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span className="flex-1 text-xs text-white/70 truncate">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </span>
              <button
                onClick={onCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  copied ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
