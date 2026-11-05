import Link from 'next/link';
import { CalendarDays, Radio, User } from 'lucide-react';

/** Card for the public /classes page — used for both one-off live classes and live series. */
export function PublicClassCard({
  href,
  title,
  description,
  thumbnailUrl,
  instructor,
  when,
  price,
  badge,
  isLive = false,
  eager = false,
}: {
  href: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  instructor?: string | null;
  when?: string | null;
  price: string;
  badge: string;
  isLive?: boolean;
  eager?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border overflow-hidden hover:border-accent-cyan/40 transition-colors bg-white/[0.02]"
    >
      <div className="relative h-44 bg-white/5 overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- creator uploads come from several hosts
          <img
            src={thumbnailUrl}
            alt={title}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Radio className="w-8 h-8 text-white/10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
          {isLive ? '● Live now' : badge}
        </span>
        <span className="absolute top-3 right-3 rounded bg-white px-2 py-1 text-xs font-bold text-[#1f2636]">{price}</span>
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="text-base font-semibold text-text-primary line-clamp-2 group-hover:text-accent-cyan transition-colors">
          {title}
        </h3>
        {description && <p className="text-sm text-text-secondary line-clamp-2">{description}</p>}
        <div className="mt-auto pt-2 flex flex-col gap-1 text-xs text-text-secondary">
          {instructor && (
            <span className="flex items-center gap-1.5">
              <User size={13} aria-hidden="true" /> {instructor}
            </span>
          )}
          {when && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} aria-hidden="true" /> {when}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
