'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If fetch failed or no user found, redirect to login
    if (error || !user) {
        console.log('❌ No user or error in AdminGuard, redirecting to signin');
        router.push('/signin');
        return;
    }

    if (user.role !== 'admin') {
        console.log('⚠️ Non-admin user trying to access admin panel, redirecting to dashboard');
        router.push('/dashboard'); 
        return;
    }
    
    console.log('✅ Admin user verified in AdminGuard');

  }, [user, loading, error, router]);

  // Show loading state while fetching user info
  if (loading) {
      return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Verifying access...</div>;
  }

  // If we have a user but they are not admin, we handled redirect in useEffect.
  // We return null to avoid flashing content before redirect completes (though isAuthorized state pattern effectively did this too).
  // However, since we return early if !user, we can safely render children if user is admin.
  
  if (user?.role === 'admin') {
      return <>{children}</>;
  }

  return null;
}
