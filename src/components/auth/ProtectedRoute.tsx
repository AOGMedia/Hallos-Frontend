
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/auth";
type PersistApi = { persist?: { hasHydrated?: () => boolean } };

// Helper to read cookie by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Zustand state
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setCookieAuth = useAuthStore((s) => s.setCookieAuth);

  const hasHydrated = (useAuthStore as unknown as PersistApi).persist?.hasHydrated?.() ?? true;

  //  2. Local loading to block UI until EVERYTHING resolves
  const [loading, setLoading] = useState(true);

  // ---- HANDLE GOOGLE OAUTH TOKENS ----
  useEffect(() => {
    if (!hasHydrated) return; // Wait for Zustand to load

    const url = new URL(window.location.href);

    // OAuth JWTs always contain exactly two dots (header.payload.sig).
    // Quiz tokens are 64-char hex strings with no dots.
    // Only treat ?token= as an auth token if it is a JWT.
    const isJWT = (t: string) => (t.match(/\./g) || []).length === 2;

    const rawToken = url.searchParams.get("token");
    const oauthToken =
      (rawToken && isJWT(rawToken) ? rawToken : null) ||
      url.searchParams.get("access_token") ||
      url.searchParams.get("id_token");

    if (oauthToken) {
      setAuth(oauthToken);

      url.searchParams.delete("token");
      url.searchParams.delete("access_token");
      url.searchParams.delete("id_token");

      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [hasHydrated, setAuth]);

  // ---- MAIN AUTH CHECK ----
  useEffect(() => {
    if (!hasHydrated) return; // Wait for Zustand first

    
    const verify = async () => {
  try {
    // 1. Check localStorage first (existing users)
    let token = localStorage.getItem("auth_token");

    // 2. Check cookie (OAuth users)
    if (!token) {
      token = getCookie("token");
      if (token) {
        // Store in localStorage for consistency
        localStorage.setItem("auth_token", token);
      }
    }

    if (token) {
      setAuth(token);
      setLoading(false);
      return;
    }

    // 3. Try /auth/me with cookie auth
    const res = await apiClient.get<{ user: User }>("/auth/me");

    if (res.data?.user?.id) {
      setCookieAuth(res.data.user);
      setLoading(false);
      return;
    }

    // ❌ AUTH FAILED — DO NOT UNLOCK UI
    const currentPath = window.location.pathname + window.location.search;
    const redirectUrl = currentPath !== '/signin' && currentPath !== '/signup' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
    // console.log('ProtectedRoute: Auth failed, redirecting from:', currentPath);
    // console.log('ProtectedRoute: Redirect URL:', `/signin${redirectUrl}`);
    
    // Store redirect in localStorage as backup
    if (currentPath !== '/signin' && currentPath !== '/signup') {
      localStorage.setItem('auth_redirect', currentPath);
    }
    
    router.replace(`/signin${redirectUrl}`);
  } catch {
    const currentPath = window.location.pathname + window.location.search;
    const redirectUrl = currentPath !== '/signin' && currentPath !== '/signup' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
    console.log('ProtectedRoute: Auth check failed, redirecting from:', currentPath);
    console.log('ProtectedRoute: Redirect URL:', `/signin${redirectUrl}`);
    
    // Store redirect in localStorage as backup
    if (currentPath !== '/signin' && currentPath !== '/signup') {
      localStorage.setItem('auth_redirect', currentPath);
    }
    
    router.replace(`/signin${redirectUrl}`);
  }
};


    verify();
  }, [hasHydrated, isAuthenticated, router, setAuth, setCookieAuth]);

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}