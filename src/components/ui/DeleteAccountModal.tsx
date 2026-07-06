'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import CloseXIcon from '@/components/icons/CloseXIcon';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-background-darker rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close modal"
        >
          <CloseXIcon className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-text-primary mb-8">
          Delete account?
        </h2>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {/* No Button */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "flex-1 py-3 px-6 rounded-full font-medium transition-colors",
              "bg-transparent border-2 border-border text-text-primary",
              "hover:bg-background-dark hover:border-text-muted",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            No
          </button>

          {/* Yes Button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 py-3 px-6 rounded-full font-medium transition-colors",
              "bg-primary text-white",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              'Yes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;