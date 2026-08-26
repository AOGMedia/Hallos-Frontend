'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { blogService, BlogPost } from '@/services/blogService';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await blogService.listPublished({ page });
        if (cancelled) return;
        setPosts(res.posts);
        setTotalPages(res.totalPages);
      } catch {
        if (!cancelled) setError("Couldn't load posts. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1100px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Blog</h1>
        <p className="text-text-secondary">Updates, guides, and news from Hallos.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <div className="h-40 bg-white/5 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-text-secondary">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mx-auto mb-6">
            <Newspaper className="w-6 h-6 text-accent-cyan" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Nothing here yet</h2>
          <p className="text-text-secondary">Check back soon for our first post.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-border overflow-hidden hover:border-accent-cyan/40 transition-colors bg-white/[0.02]"
              >
                <div className="h-40 bg-white/5 overflow-hidden">
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote S3 image, varying dims
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-text-secondary mb-1.5">
                    {post.publishedAt ? fmtDate(post.publishedAt) : ''}
                  </p>
                  <h2 className="text-base font-semibold text-text-primary mb-1.5 line-clamp-2 group-hover:text-accent-cyan transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
