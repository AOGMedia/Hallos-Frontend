'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShareFeedbackModal } from './ShareFeedbackModal';
import { feedbackService } from '@/services/feedbackService';

export default function GlobalFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [shouldAutoShow, setShouldAutoShow] = useState(false);

  // Initial interaction detection
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('mousemove', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Check backend for popup status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await feedbackService.getStatus();
        if (data.success && data.status?.shouldShowPopup) {
          setShouldAutoShow(true);
        }
      } catch (error) {
        console.error('Error checking feedback status:', error);
      }
    };
    checkStatus();
  }, []);

  // Trigger popup when both conditions met
  useEffect(() => {
    if (hasInteracted && shouldAutoShow) {
      // Small delay after interaction so it feels natural
      const timeout = setTimeout(() => {
        setIsOpen(true);
        setShouldAutoShow(false); // Don't auto-show again in this session
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [hasInteracted, shouldAutoShow]);

  // Handle manual explicit close (we should call dismiss so it won't show for 30 days)
  const handleClose = useCallback(async () => {
    setIsOpen(false);
    
    try {
      await feedbackService.dismissPopup();
    } catch (error) {
      console.error('Error dismissing feedback:', error);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    // Called when feedback is successfully submitted
    // Modal will handle its own auto-close after 3s
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-[#333333] text-white p-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 group flex items-center gap-2 hover:border-primary/80"
        aria-label="Share Feedback"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="w-0 overflow-hidden group-hover:w-20 whitespace-nowrap transition-all duration-300 ease-in-out text-sm font-medium">
          Feedback
        </span>
      </button>

      <ShareFeedbackModal 
        isOpen={isOpen} 
        onClose={handleClose} 
        onSuccess={handleSuccess}
      />
    </>
  );
}
