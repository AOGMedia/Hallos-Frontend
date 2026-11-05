import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import MarkdownBody from '@/components/blog/MarkdownBody';
import { buildMetadata } from '@/lib/metadata';
import { fetchBlogPost } from '@/lib/seo/publicApi';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/seo/jsonLd';
import { JsonLd } from '@/components/seo/JsonLd';

/**
 * Server-rendered so the article itself is in the HTML crawlers index.
 * A post the backend confirms is missing returns a real 404 (not a 200
 * "not found" screen); a backend outage is an error, never a 404, so a
 * blip never tells Google the post is gone.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ISR: posts render fully before the response starts, so a missing post gets
// a true HTTP 404 (a streamed dynamic page can only inject noindex), and
// published posts are served from cache. Edits show up within 5 minutes.
export const revalidate = 300;

/**
 * Empty on purpose: every post renders on its first request and is then
 * cached. Prebuilding here would make deploys fail whenever the backend
 * blips during `next build`.
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Posts usually open with "# <title>", which would repeat the page H1. */
function withoutLeadingTitle(body: string, title: string) {
  const [first, ...rest] = body.replace(/\r\n/g, '\n').split('\n');
  const heading = first.match(/^#\s+(.*)$/);
  return heading && heading[1].trim().toLowerCase() === title.trim().toLowerCase() ? rest.join('\n') : body;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const path = `/blog/${slug}`;
  const { post } = await fetchBlogPost(slug);
  if (!post) {
    return buildMetadata({ title: 'Blog', description: 'Updates, guides, and news from Hallos.', path, noIndex: true });
  }
  return buildMetadata({
    title: post.title,
    description: post.excerpt || post.body,
    thumbnail: post.coverImageUrl,
    path,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.authorName ? [post.authorName] : undefined,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, notFound: missing } = await fetchBlogPost(slug);

  if (missing) notFound();

  // Backend unreachable: throw rather than render, so ISR keeps serving the
  // last good copy (and an uncached hit is a retryable 5xx, not a cached
  // "error" page). error.tsx shows the friendly message.
  if (!post) throw new Error(`Blog post "${slug}" could not be loaded`);

  const path = `/blog/${post.slug}`;

  return (
    <article className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[760px] mx-auto">
      <JsonLd
        data={[
          blogPostingSchema(post, path),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Back to blog
        </Link>
      </nav>

      <p className="text-xs text-text-secondary mb-3">
        {post.publishedAt ? <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt)}</time> : ''}
        {post.authorName ? <> · <span>{post.authorName}</span></> : ''}
      </p>
      <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-6">{post.title}</h1>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote S3 image, varying dims
        <img
          src={post.coverImageUrl}
          alt={post.title}
          fetchPriority="high"
          decoding="async"
          className="w-full rounded-xl mb-8 border border-border object-cover max-h-[420px]"
        />
      )}

      <MarkdownBody content={withoutLeadingTitle(post.body, post.title)} />
    </article>
  );
}
