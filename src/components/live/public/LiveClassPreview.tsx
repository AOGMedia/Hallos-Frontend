import { CalendarDays, Radio, Tag, User } from 'lucide-react';
import type { PublicLiveClass } from '@/lib/seo/publicApi';
import { formatClassTime, formatPrice } from '@/lib/live/publicFormat';

/**
 * Read-only summary of a live class for visitors. `actions` is the
 * call-to-action area (sign in / opening the class), supplied by the caller
 * because it depends on who is viewing.
 */
export function LiveClassPreview({ liveClass, actions }: { liveClass: PublicLiveClass; actions: React.ReactNode }) {
  const when = formatClassTime(liveClass.startTime);

  return (
    <article className="min-h-screen px-4 sm:px-6 lg:px-10 pt-16 pb-20 max-w-[900px] mx-auto">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/5 mb-8">
        {liveClass.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- creator uploads come from several hosts
          <img src={liveClass.thumbnailUrl} alt={liveClass.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Radio className="w-12 h-12 text-white/10" aria-hidden="true" />
          </div>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-cyan mb-2">Live class</p>
      <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-5">{liveClass.title}</h1>

      <ul className="flex flex-wrap gap-2 text-sm text-text-secondary mb-8">
        {liveClass.instructorName && (
          <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
            <User size={14} aria-hidden="true" /> {liveClass.instructorName}
          </li>
        )}
        {when && (
          <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
            <CalendarDays size={14} aria-hidden="true" /> {when}
          </li>
        )}
        <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
          <Tag size={14} aria-hidden="true" /> {formatPrice(liveClass.price, liveClass.currency)}
        </li>
      </ul>

      <div className="rounded-xl border border-border bg-white/[0.03] p-5 mb-8">{actions}</div>

      {liveClass.description && (
        <section aria-label="About this class" className="text-text-secondary leading-relaxed whitespace-pre-line">
          {liveClass.description}
        </section>
      )}
    </article>
  );
}
