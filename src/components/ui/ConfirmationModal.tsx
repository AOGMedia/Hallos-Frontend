'use client';

import { Button } from '@/components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Yes', 
  cancelText = 'No', 
  onConfirm, 
  onCancel,
  isDestructive = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[10000] p-4">
      <div className="bg-background-dark rounded-3xl p-8 max-w-md w-full border border-border">
        <h3 className="text-medium font-semibold text-text-primary text-center mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-text-muted text-center mb-8">
            {message}
          </p>
        )}
        {!message && <div className="mb-6"></div>}
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
