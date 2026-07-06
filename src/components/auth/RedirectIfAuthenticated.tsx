'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';
import type { User } from '@/types/auth';

type PersistApi = { persist?: { hasHydrated?: () => boolean } };

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RedirectIfAuthenticated({ 
  children, 
  redirectTo = '/dashboard' 
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  
  // Zustand state
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setCookieAuth = useAuthStore((s) => s.setCookieAuth);
  
  const hasHydrated = (useAuthStore as unknown as PersistApi).persist?.hasHydrated?.() ?? true;
  
  // Local loading to prevent flash of auth form
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return; // Wait for Zustand to load

    const checkAuth = async () => {
      try {
        // Check localStorage token first
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // User has token, redirect them
          setAuth(token);
          router.replace(redirectTo);
          return;
        }

        // Check if user has valid session via cookie
        if (!isAuthenticated) {
          try {
            const res = await apiClient.get<{ user: User }>('/auth/me');
            
            if (res.data?.user?.id) {
              // User has valid session, redirect them
              setCookieAuth(res.data.user);
              router.replace(redirectTo);
              return;
            }
          } catch {
            // No valid session, user can stay on auth page
          }
        } else {
          // User is already authenticated in store, redirect them
          router.replace(redirectTo);
          return;
        }

        // User is not authenticated, show auth page
        setLoading(false);
      } catch {
        // Error checking auth, assume not authenticated
        setLoading(false);
      }
    };

    checkAuth();
  }, [hasHydrated, isAuthenticated, router, setAuth, setCookieAuth, redirectTo]);

  // Show loading while checking auth status
  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  // User is not authenticated, show the auth page
  return <>{children}</>;
}
