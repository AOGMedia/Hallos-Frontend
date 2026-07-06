'use client';

import { ReactNode, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-[500px]',
  className = ''
}: ModalProps) {
  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={handleBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative w-full ${maxWidth} max-h-[95vh] flex flex-col gap-6 rounded-[32px] sm:rounded-[40px] bg-background-dark p-6 sm:p-10 ${className}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {title && (
              <div className="flex items-center justify-between shrink-0 mb-2">
                <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
              </div>
            )}
            
            <div className="overflow-y-auto custom-scrollbar flex flex-col gap-6 flex-1">
              {children}
            </div>

            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 text-text-gray hover:bg-white/10 hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
