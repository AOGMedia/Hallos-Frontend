'use client';

import Link from 'next/link';
import { Newspaper } from 'lucide-react';

/** Shown when the backend can't be reached; offers a retry instead of a dead end. */
export default function BlogPostError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mx-auto mb-6">
          <Newspaper className="w-6 h-6 text-accent-cyan" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Couldn&apos;t load this post</h1>
        <p className="text-text-secondary mb-8">Please try again in a moment.</p>
        <div className="flex items-center justify-center gap-6">
          <button onClick={reset} className="text-nav text-accent-cyan hover:underline">
            Try again
          </button>
          <Link href="/blog" className="text-nav text-accent-cyan hover:underline">
            Back to blog
          </Link>
        </div>
      </div>
    </div>
  );
}
