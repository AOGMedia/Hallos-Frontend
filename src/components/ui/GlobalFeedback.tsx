'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShareFeedbackModal } from './ShareFeedbackModal';
import { QuickActionsButton } from './QuickActionsButton';
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
      <QuickActionsButton onFeedback={() => setIsOpen(true)} />

      <ShareFeedbackModal
        isOpen={isOpen} 
        onClose={handleClose} 
        onSuccess={handleSuccess}
      />
    </>
  );
}
