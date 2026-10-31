import Link from 'next/link';
import { Radio } from 'lucide-react';
import { Footer } from '@/components/sections/Footer';
import { PublicClassCard } from '@/components/live/public/PublicClassCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { buttonClasses } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/metadata';
import { breadcrumbSchema } from '@/lib/seo/jsonLd';
import { fetchPublicLiveClasses, fetchPublicSeries } from '@/lib/seo/publicApi';
import { toDescription } from '@/lib/seo/site';
import { formatClassTime, formatPrice } from '@/lib/live/publicFormat';

/**
 * Public live-class listing: upcoming public live classes and live series,
 * viewable without signing in. /dashboard/classes stays the signed-in
 * version (with invites and purchases).
 */

// Classes come and go quickly; refresh the cached page every 5 minutes.
export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'Live online classes from top creators',
  description:
    'Join interactive live online classes and multi-session live series taught by creators on Hallos. Ask questions in real time and learn alongside others.',
  path: '/classes',
});

export default async function ClassesPage() {
  const [classes, allSeries] = await Promise.all([fetchPublicLiveClasses(), fetchPublicSeries()]);
  const series = allSeries.filter((s) => (s.privacy ?? 'public') === 'public');
  const now = Date.now();
  const isLiveNow = (start: string | null, end: string | null, status: string | null) =>
    status === 'live' || (!!start && !!end && now >= new Date(start).getTime() && now <= new Date(end).getTime());

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1200px] mx-auto">
        <JsonLd
          data={breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Live classes', path: '/classes' },
          ])}
        />

        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">Live Classes</h1>
          <p className="text-text-secondary leading-relaxed">
            Learn live from creators on Hallos. Join a one-off class or a multi-session live series, ask questions in real
            time and learn alongside other students.
          </p>
        </header>

        {classes.length > 0 && (
          <section aria-labelledby="upcoming-classes" className="mb-14">
            <h2 id="upcoming-classes" className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
              Upcoming live classes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((c, i) => (
                <PublicClassCard
                  key={c.id}
                  href={`/live/${c.id}`}
                  title={c.title}
                  description={toDescription(c.description, 140)}
                  thumbnailUrl={c.thumbnailUrl}
                  instructor={c.instructorName}
                  when={formatClassTime(c.startTime)}
                  price={formatPrice(c.price, c.currency)}
                  badge="Live class"
                  isLive={isLiveNow(c.startTime, c.endTime, c.status)}
                  eager={i < 3}
                />
              ))}
            </div>
          </section>
        )}

        {series.length > 0 && (
          <section aria-labelledby="live-series" className="mb-14">
            <h2 id="live-series" className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
              Live series
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {series.map((s, i) => (
                <PublicClassCard
                  key={s.id}
                  href={`/series/${s.id}`}
                  title={s.title}
                  description={toDescription(s.description, 140)}
                  thumbnailUrl={s.thumbnailUrl}
                  instructor={[s.creator?.firstname, s.creator?.lastname].filter(Boolean).join(' ') || null}
                  when={s.startDate ? `Starts ${formatClassTime(s.startDate)}` : null}
                  price={formatPrice(s.price, s.currency)}
                  badge="Live series"
                  eager={classes.length === 0 && i < 3}
                />
              ))}
            </div>
          </section>
        )}

        {classes.length === 0 && series.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mx-auto mb-6">
              <Radio className="w-6 h-6 text-accent-cyan" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No live classes scheduled right now</h2>
            <p className="text-text-secondary mb-8">New classes are added all the time. Meanwhile, learn at your own pace.</p>
            <Link href="/course" className={buttonClasses({ variant: 'primary' })}>
              Browse self-paced courses
            </Link>
          </div>
        )}

        <section className="rounded-xl border border-border bg-white/[0.03] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Prefer to learn at your own pace?</h2>
            <p className="text-sm text-text-secondary">Explore 3,000+ self-paced online courses with certificates.</p>
          </div>
          <Link href="/course" className={buttonClasses({ variant: 'outline', className: 'text-center whitespace-nowrap' })}>
            Browse courses
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}
