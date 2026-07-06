'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';

interface DeleteAccountPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteAccountPasswordModal = React.memo<DeleteAccountPasswordModalProps>(({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(() => {
    if (!password.trim()) return;
    onConfirm();
  }, [password, onConfirm]);

  const handleClose = useCallback(() => {
    setPassword('');
    onClose();
  }, [onClose]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={!isLoading ? handleClose : undefined}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background-darker rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
              aria-label="Close delete account form"
            >
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-lg font-medium text-white">Delete Account</h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Password Input Section */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm text-white mb-3">
                Enter password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-gray-400 focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>

            {/* Delete Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!password.trim() || isLoading}
                className="flex items-center justify-center gap-2 bg-accent-red hover:bg-accent-red/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-full transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

DeleteAccountPasswordModal.displayName = 'DeleteAccountPasswordModal';