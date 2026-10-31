import Link from 'next/link';
import { Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildMetadata } from '@/lib/metadata';
import { fetchBlogPage } from '@/lib/seo/publicApi';
import { blogListSchema, breadcrumbSchema } from '@/lib/seo/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

/**
 * Server-rendered so crawlers get the full post list in the HTML. Pagination
 * is a real `?page=N` link (not client state) so every page is reachable.
 */

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

function pageHref(page: number) {
  return page <= 1 ? '/blog' : `/blog?page=${page}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ searchParams }: PageProps) {
  const page = parsePage((await searchParams).page);
  // Same cached fetch the page uses. Empty pages past the end stay out of the
  // index (decided here because a streamed page can't change its status code).
  const data = await fetchBlogPage(page);
  const isEmptyExtraPage = page > 1 && (!data || data.posts.length === 0);
  return buildMetadata({
    title: page > 1 ? `Blog — Page ${page}` : 'Blog: guides on online learning, courses and the creator economy',
    description:
      'Guides, tips and news from Hallos on online courses, live classes, building skills and earning as a creator.',
    path: pageHref(page),
    noIndex: isEmptyExtraPage,
  });
}

export default async function BlogPage({ searchParams }: PageProps) {
  const page = parsePage((await searchParams).page);
  const data = await fetchBlogPage(page);
  const posts = data?.posts ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1100px] mx-auto">
      {posts.length > 0 && (
        <JsonLd
          data={[
            blogListSchema(posts),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
            ]),
          ]}
        />
      )}

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Blog</h1>
        <p className="text-text-secondary">Updates, guides, and news from Hallos.</p>
      </div>

      {!data && (
        <div className="text-center py-16 text-text-secondary">
          Couldn&apos;t load posts. Please try again.
        </div>
      )}

      {data && posts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mx-auto mb-6">
            <Newspaper className="w-6 h-6 text-accent-cyan" />
          </div>
          {page > 1 ? (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-2">No posts on this page</h2>
              <Link href="/blog" className="text-nav text-accent-cyan hover:underline">
                Back to the latest posts
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-2">Nothing here yet</h2>
              <p className="text-text-secondary">Check back soon for our first post.</p>
            </>
          )}
        </div>
      )}

      {posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
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
                      alt={post.title}
                      // First row is above the fold; the rest can wait.
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
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
                    {post.publishedAt ? <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt)}</time> : ''}
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
            <nav aria-label="Blog pages" className="flex items-center justify-center gap-3 mt-10">
              <PageLink page={page - 1} disabled={page <= 1} label="Previous page">
                <ChevronLeft size={18} />
              </PageLink>
              <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
              <PageLink page={page + 1} disabled={page >= totalPages} label="Next page">
                <ChevronRight size={18} />
              </PageLink>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

const PAGE_LINK_CLASS =
  'p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors';

function PageLink({
  page,
  disabled,
  label,
  children,
}: {
  page: number;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={`${PAGE_LINK_CLASS} opacity-30 cursor-not-allowed`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={pageHref(page)} aria-label={label} className={PAGE_LINK_CLASS}>
      {children}
    </Link>
  );
}
