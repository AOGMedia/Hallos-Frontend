'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackReferralClick } from '@/lib/api/referral';

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      // Store the referral code in localStorage so we can retrieve it during checkout
      localStorage.setItem('hallos-promo-ref', ref);
      
      // Optionally notify the backend for analytics
      trackReferralClick(ref).catch((err) => {
        console.error('Failed to track referral click:', err);
      });
    }
  }, [searchParams]);

  return null; // This is a logic-only component
}
