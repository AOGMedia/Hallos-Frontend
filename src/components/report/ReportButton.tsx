'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Flag, X } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { REPORT_REASONS, reportsApi, type ReportReason, type ReportTargetType } from '@/lib/api/reports';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string | number;
  /** How the thing is named in the dialog, e.g. "this video". */
  subject?: string;
  /** "text" shows the word Report, "icon" only the flag (with an accessible label). */
  appearance?: 'text' | 'icon';
  className?: string;
}

function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 429) return 'You’ve sent a lot of reports. Please try again later.';
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (!error.response) return 'You seem to be offline. Check your connection and try again.';
  }
  return 'We couldn’t send your report. Please try again.';
}

export function ReportButton({ targetType, targetId, subject = 'this', appearance = 'text', className = '' }: ReportButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The dialog renders into <body>, so it also works inside other overlays.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    // Reset after the closing animation.
    setTimeout(() => {
      setReason(null);
      setDetails('');
      setSent(false);
      setError(null);
    }, 250);
  }, []);

  // While open: Escape closes, and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const openDialog = () => {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    setOpen(true);
  };

  const selected = REPORT_REASONS.find((option) => option.value === reason);
  const needsDetails = reason === 'other' && !details.trim();

  const submit = async () => {
    if (!reason || needsDetails || sending) return;
    setSending(true);
    setError(null);
    try {
      await reportsApi.create({ targetType, targetId, reason, details: details.trim() || undefined });
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="flex w-full max-h-[90dvh] flex-col overflow-hidden rounded-t-[28px] bg-background-dark sm:max-w-[460px] sm:rounded-[28px]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {sent ? (
              <div className="flex flex-col items-center gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 text-center" role="status">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check size={28} aria-hidden />
                </div>
                <h2 id="report-title" className="text-xl font-semibold text-text-primary">Thanks for letting us know</h2>
                <p className="max-w-sm text-sm text-text-gray">
                  Our team will review it. Your report is private, so the person you reported won’t see who sent it.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-3 w-full rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/15 sm:w-auto"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Header — stays put */}
                <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-3 pt-5 sm:pt-6">
                  <div className="min-w-0">
                    <h2 id="report-title" className="text-xl font-semibold text-text-primary">Report {subject}</h2>
                    <p className="mt-1 text-sm text-text-gray">Reports are private and reviewed by the Hallos team.</p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-text-gray transition-colors hover:bg-white/10 hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body — scrolls only on very short screens */}
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-2">
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-text-primary">What’s wrong?</p>
                    <div role="radiogroup" aria-label="Reason" className="flex flex-wrap gap-2">
                      {REPORT_REASONS.map((option) => {
                        const isSelected = reason === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            title={option.hint}
                            onClick={() => setReason(option.value)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-white/10 text-text-primary hover:border-white/25 hover:bg-white/5'
                            }`}
                          >
                            {isSelected ? <Check size={14} strokeWidth={3} aria-hidden /> : null}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 min-h-[1.25rem] text-xs text-text-gray" aria-live="polite">
                      {selected?.hint ?? ''}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="report-details" className="text-sm font-medium text-text-primary">
                      Anything else?{' '}
                      <span className="font-normal text-text-gray">{reason === 'other' ? '(required)' : '(optional)'}</span>
                    </label>
                    <textarea
                      id="report-details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      maxLength={2000}
                      rows={2}
                      placeholder="Add details that help us understand"
                      className="w-full resize-none sm:min-h-[6rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-text-primary placeholder:text-text-gray focus:border-primary focus:outline-none sm:text-sm"
                    />
                  </div>

                  {error ? (
                    <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                      {error}
                    </p>
                  ) : null}
                </div>

                {/* Actions — stay put */}
                <div className="flex shrink-0 gap-3 border-t border-white/5 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded-full px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/10 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!reason || needsDetails || sending}
                    className="flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[140px] sm:flex-none"
                  >
                    {sending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-label="Sending" />
                    ) : (
                      'Send report'
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={appearance === 'icon' ? `Report ${subject}` : undefined}
        className={`inline-flex items-center gap-1.5 rounded-full text-sm text-text-gray transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${appearance === 'icon' ? 'p-2 hover:bg-white/5' : 'px-3 py-1.5 hover:bg-white/5'} ${className}`}
      >
        <Flag size={16} aria-hidden />
        {appearance === 'text' ? <span>Report</span> : null}
      </button>
      {mounted ? createPortal(dialog, document.body) : null}
    </>
  );
}
