"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface CustomAlertProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'from-green-500 to-emerald-600',
    info: 'from-blue-500 to-indigo-600',
    warning: 'from-yellow-500 to-orange-600',
    error: 'from-red-500 to-pink-600',
  };

  const icons = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]"
    >
      <div
        className={`bg-gradient-to-r ${colors[type]} rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-[500px]`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white text-xl font-bold">{icons[type]}</span>
          </motion.div>
          <p className="text-white font-medium text-sm flex-1">{message}</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
