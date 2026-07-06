'use client';

import { Button } from '@/components/ui/Button';

interface CancelConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelConfirmationModal({ onConfirm, onCancel }: CancelConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[10000] p-4">
      <div className="bg-background-dark rounded-3xl p-8 max-w-md w-full border border-border">
        <h3 className="text-medium text-text-primary text-center mb-8">
          Cancel video upload?
        </h3>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            No
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
}