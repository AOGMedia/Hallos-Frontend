'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

// Keep in sync with ../../page.tsx
// Production: https://quiz.hallos.net
// Local dev:  set NEXT_PUBLIC_QUIZ_URL=http://localhost:5173 in .env.local
const QUIZ_URL = process.env.NEXT_PUBLIC_QUIZ_URL ?? 'https://quiz.hallos.net';

/**
 * Quiz "invite a friend" landing.
 *
 * The quiz backend mints invite links as {CLIENT_URL}/invite/{token}, where
 * CLIENT_URL is this app's /dashboard/games route — so they arrive here. The
 * sibling page.tsx always redirects to the quiz app root, which would drop the
 * token, hence this dedicated segment.
 *
 * Auth is already handled: ProtectedRoute in the dashboard layout blocks
 * rendering until the user is signed in, and on failure redirects to
 * /signin?redirect=<this path>, so the invite token survives signin *and*
 * signup (useAuth honours ?redirect= on both).
 *
 * The invite token goes through as a PATH param and the JWT as ?token=, which
 * is the handoff shape the quiz app expects — it stores ?token= as the session
 * JWT and would otherwise mistake an invite token for one. The quiz app owns
 * all the invite UI (who invited you, the wager, play now / not yet); this page
 * only forwards.
 */
export default function GamesInvitePage() {
  const params = useParams();
  const token = params.token as string;

  useEffect(() => {
    if (!token) return;

    // Cookie-auth sessions have no localStorage token; forward without it and
    // let the quiz app re-auth, same as the sibling games page does.
    const jwt = localStorage.getItem('auth_token');
    const target = `${QUIZ_URL}/invite/${encodeURIComponent(token)}`;

    window.location.href = jwt
      ? `${target}?token=${encodeURIComponent(jwt)}`
      : target;
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Opening your invite...</p>
      </div>
    </div>
  );
}
