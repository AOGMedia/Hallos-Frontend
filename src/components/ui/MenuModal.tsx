'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface MenuModalItem {
  icon: ReactNode;
  label: ReactNode;
  onClick: () => void;
  /** Highlight the tile (teal accent) */
  highlighted?: boolean;
  /** Show a dot indicator on the icon */
  dot?: boolean;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items: MenuModalItem[];
}

export function MenuModal({ isOpen, onClose, title = 'Menu', items }: MenuModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.80)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[560px] rounded-3xl p-8"
            style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center mb-8 relative">
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="absolute right-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <X size={18} className="text-text-primary" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { item.onClick(); onClose(); }}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-colors"
                  style={item.highlighted
                    ? { background: 'rgba(0,171,228,0.12)', border: '1px solid rgba(0,171,228,0.20)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  {/* Icon wrapper with optional dot */}
                  <div className="relative">
                    <span className={item.highlighted ? 'text-[#00abe4]' : 'text-text-primary'}>
                      {item.icon}
                    </span>
                    {item.dot && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00abe4]" />
                    )}
                  </div>
                  <span
                    className="text-sm font-medium text-center leading-tight"
                    style={item.highlighted ? { color: '#00abe4', textDecoration: 'underline' } : { color: 'rgba(229,229,229,0.80)' }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
