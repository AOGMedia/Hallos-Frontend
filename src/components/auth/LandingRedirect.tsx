'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Silently redirects authenticated users away from the landing page.
 * Checks localStorage for an active token — no API call needed.
 * Only runs on the client, layout.tsx stays a server component.
 */
export function LandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  return null;
}
