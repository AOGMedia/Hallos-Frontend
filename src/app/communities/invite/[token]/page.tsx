'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { joinCommunityViaInvite } from '@/lib/api/community';
import { useAuthStore } from '@/store/authStore';

export default function CommunityInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    // Not logged in — redirect to signin with redirect back here
    if (!isAuthenticated) {
      router.replace(`/signin?redirect=/communities/invite/${token}`);
      return;
    }

    // Logged in — accept the invite
    joinCommunityViaInvite(token)
      .then((res) => {
        const communityId = res?.data?.id || res?.data?.communityId;
        setStatus('success');
        setMessage('You\'ve joined the community!');
        // Redirect to the community page after a short delay
        setTimeout(() => {
          if (communityId) {
            router.replace(`/dashboard/community/${communityId}`);
          } else {
            router.replace('/dashboard/community');
          }
        }, 1500);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'This invite link is invalid or has expired.';
        setStatus('error');
        setMessage(msg);
      });
  }, [token, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-darker">
      <div className="text-center flex flex-col items-center gap-4 p-8">
        {status === 'loading' && (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-text-primary">Joining community...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 16l6 6 10-12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-text-primary">{message}</p>
            <p className="text-sm text-text-gray">Redirecting you now...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-2xl">✕</div>
            <p className="text-lg font-semibold text-text-primary">Invite failed</p>
            <p className="text-sm text-text-gray">{message}</p>
            <button
              onClick={() => router.push('/dashboard/community')}
              className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse communities
            </button>
          </>
        )}
      </div>
    </div>
  );
}
