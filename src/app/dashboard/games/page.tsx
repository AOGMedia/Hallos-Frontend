'use client';

import { useEffect } from 'react';

// Production: https://quiz.hallos.net
// Local dev:  set NEXT_PUBLIC_QUIZ_URL=http://localhost:5173 in .env.local
const QUIZ_URL = process.env.NEXT_PUBLIC_QUIZ_URL ?? 'https://quiz.hallos.net';

export default function GamesPage() {
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const destination = token
      ? `${QUIZ_URL}/?token=${encodeURIComponent(token)}`
      : `${QUIZ_URL}/`;
    window.location.href = destination;
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading games...</p>
      </div>
    </div>
  );
}
