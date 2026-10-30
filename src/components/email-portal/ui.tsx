'use client';

import { ReactNode, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import type { CampaignStatus, RecipientStatus } from '@/types/emailPortal';

export const formatNumber = (value: number) => new Intl.NumberFormat('en-NG').format(value);

export const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : '—';

export const inputClass =
  'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50';

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50';

export const dangerButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50';

const STATUS_STYLES: Record<CampaignStatus | RecipientStatus, string> = {
  draft: 'border-zinc-600/40 bg-zinc-500/10 text-zinc-300',
  scheduled: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  sending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  pending: 'border-zinc-600/40 bg-zinc-500/10 text-zinc-300',
  sent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  failed: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  skipped: 'border-zinc-600/40 bg-zinc-500/10 text-zinc-400',
};

export function StatusBadge({ status }: { status: CampaignStatus | RecipientStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {status === 'sending' && <Loader2 size={11} className="mr-1 animate-spin" />}
      {status}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function SectionTitle({ step, title, hint }: { step?: number; title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {step !== undefined && (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-300">
          {step}
        </span>
      )}
      <div>
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
      <Loader2 size={18} className="animate-spin" />
      {label}
    </div>
  );
}

export function ProgressBar({ sent, failed, total }: { sent: number; failed: number; total: number }) {
  const pct = (n: number) => (total > 0 ? Math.min((n / total) * 100, 100) : 0);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
      <div className="flex h-full">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct(sent)}%` }} />
        <div className="h-full bg-rose-500 transition-all" style={{ width: `${pct(failed)}%` }} />
      </div>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}
