import { Star } from "lucide-react";
import type { ChoiceStats, RatingStats } from "../api";

/** Building blocks for the creator's feedback results (dark, brand violet). */

export function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#161c2b] p-5">
      <h2 className="text-[15px] font-semibold text-white">{title}</h2>
      {note ? <p className="mt-0.5 text-xs text-white/50">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Rating({ value, className = "" }: { value: number | null; className?: string }) {
  if (value === null) return <span className={`text-white/50 ${className}`}>No ratings yet</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 tabular-nums ${className}`} aria-label={`${value.toFixed(1)} out of 5`}>
      <Star aria-hidden className="h-[0.8em] w-[0.8em] fill-primary text-primary" />
      {value.toFixed(1)}
    </span>
  );
}

/** One row per rating, 5 at the top, with the words people saw. */
export function RatingRows({ stats, words }: { stats: RatingStats; words: string[] }) {
  const max = Math.max(...Object.values(stats.distribution), 1);
  return (
    <ul className="space-y-2.5">
      {[5, 4, 3, 2, 1].map((n) => {
        const count = stats.distribution[String(n) as keyof RatingStats["distribution"]] ?? 0;
        return (
          <li key={n} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-[13px]">
            <span className="truncate text-white/70">
              <span className="font-semibold text-white">{n}</span> · {words[n - 1]}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <span className="block h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums text-white/60">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Choices ranked by how many picked them, with the share of people who answered. */
export function ChoiceRows({
  stats,
  label,
  hide,
}: {
  stats: ChoiceStats;
  label: (value: string) => string;
  hide?: string;
}) {
  const rows = Object.entries(stats.counts)
    .filter(([value, count]) => value !== hide && count > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!rows.length) return <p className="text-sm text-white/50">Nobody picked anything here.</p>;
  return (
    <ul className="space-y-3">
      {rows.map(([value, count]) => {
        const share = stats.answered ? Math.round((count / stats.answered) * 100) : 0;
        return (
          <li key={value}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate text-white/85">{label(value)}</span>
              <span className="shrink-0 tabular-nums text-white/60">
                {count} <span className="text-xs">({share}%)</span>
              </span>
            </div>
            <span className="block h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <span className="block h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${share}%` }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
