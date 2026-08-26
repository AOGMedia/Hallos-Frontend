'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Newspaper } from 'lucide-react';
import { blogService, BlogPost } from '@/services/blogService';
import MarkdownBody from '@/components/blog/MarkdownBody';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await blogService.getPublishedBySlug(slug);
        if (!cancelled) setPost(res.post);
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as { response?: { status?: number } };
        if (e.response?.status === 404) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[760px] mx-auto animate-pulse">
        <div className="h-4 w-24 bg-white/5 rounded mb-8" />
        <div className="h-9 w-3/4 bg-white/5 rounded mb-4" />
        <div className="h-64 bg-white/5 rounded-xl mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !post) {
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

  return (
    <article className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[760px] mx-auto">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors mb-8"
      >
        <ChevronLeft size={16} /> Back to blog
      </Link>

      <p className="text-xs text-text-secondary mb-3">
        {post.publishedAt ? fmtDate(post.publishedAt) : ''}
        {post.authorName ? ` · ${post.authorName}` : ''}
      </p>
      <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-6">{post.title}</h1>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote S3 image, varying dims
        <img
          src={post.coverImageUrl}
          alt=""
          className="w-full rounded-xl mb-8 border border-border object-cover max-h-[420px]"
        />
      )}

      <MarkdownBody content={post.body} />
    </article>
  );
}
