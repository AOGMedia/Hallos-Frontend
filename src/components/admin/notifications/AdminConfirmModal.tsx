'use client';

import React from 'react';
import CloseXIcon from '@/components/icons/CloseXIcon';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface AdminConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export function AdminConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'primary'
}: AdminConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <CloseXIcon className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
          variant === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
        }`}>
          <AlertTriangle size={32} />
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-white mb-2 italic tracking-tight">{title}</h2>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
              variant === 'danger' 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20' 
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
