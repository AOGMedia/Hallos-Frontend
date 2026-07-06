'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const href = typeof window !== 'undefined' ? window.location.href : '';
    const url = href ? new URL(href) : null;
    const names = ['token','access_token','id_token','jwt','authToken','accessToken'];
    let token: string | null = null;
    for (const n of names) {
      const v = params.get(n);
      if (v) { token = v; break; }
    }
    if (!token && url && url.hash) {
      for (const n of names) {
        const m = url.hash.match(new RegExp(`${n}=([^&]+)`));
        if (m && m[1]) { token = m[1]; break; }
      }
    }
    if (token) {
      setAuth(token);
    }
    
    // Check for stored redirect destination
    const redirectTo = localStorage.getItem('auth_redirect');
    if (redirectTo) {
      console.log('OAuth: Redirecting to stored destination:', redirectTo);
      localStorage.removeItem('auth_redirect'); // Clean up
      router.replace(redirectTo);
    } else {
      console.log('OAuth: No stored redirect, going to dashboard');
      router.replace('/dashboard');
    }
  }, [params, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-text-primary">Loading...</div>
    </div>
  );
}
export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}