import Link from 'next/link';
import { Newspaper } from 'lucide-react';

/** Shown with a real 404 status when the backend confirms the post doesn't exist. */
export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mx-auto mb-6">
          <Newspaper className="w-6 h-6 text-accent-cyan" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Post not found</h1>
        <p className="text-text-secondary mb-8">
          This post may have been unpublished or the link is out of date.
        </p>
        <Link href="/blog" className="text-nav text-accent-cyan hover:underline">
          Back to blog
        </Link>
      </div>
    </div>
  );
}
