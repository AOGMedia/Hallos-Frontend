"use client";

import { useState, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/Button";

// Dynamic import with code splitting
const CreatorTourGuide = lazy(() => import('./CreatorTourGuide').then(module => ({ default: module.CreatorTourGuide })));

interface CreatorTourButtonProps {
  className?: string;
}

export function CreatorTourButton({ className }: CreatorTourButtonProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const handleOpenTour = () => {
    setIsTourOpen(true);
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
  };

  return (
    <>
      <Button 
        variant="secondary" 
        size="lg" 
        className={`w-full text-base font-bold ${className || ''}`}
        onClick={handleOpenTour}
      >
        Become a Creator
      </Button>
      {isTourOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <CreatorTourGuide isOpen={isTourOpen} onClose={handleCloseTour} />
        </Suspense>
      )}
    </>
  );
}