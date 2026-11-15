'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { CalendarClock, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { accountApi, accountKeys, errorMessage, type DeletionStatus } from '../api';
import { DeleteAccountDialog } from './DeleteAccountDialog';

const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

const rowButton =
  'flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Settings → "Your data and account": download a copy of your data, and ask
 * our team to delete your account. People can only request it; staff delete
 * it after a grace period. While a request is open it says when, with one tap
 * to keep the account.
 */
export function AccountPrivacySection() {
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: accountKeys.deletion, queryFn: accountApi.deletionStatus, staleTime: 60_000 });
  const [dialog, setDialog] = useState(false);
  const [note, setNote] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const download = useMutation({
    mutationFn: accountApi.downloadData,
    onSuccess: () => setNote({ tone: 'ok', text: 'Your data is downloading as a JSON file.' }),
    onError: async (e) => setNote({ tone: 'error', text: await errorMessage(e, 'Couldn’t prepare your data. Please try again.') }),
  });
  const keep = useMutation({
    mutationFn: accountApi.cancelDeletion,
    onSuccess: () => {
      queryClient.setQueryData<DeletionStatus>(accountKeys.deletion, (old) => (old ? { ...old, request: null } : old));
      setNote({ tone: 'ok', text: 'Your account is staying. Nothing will be deleted.' });
    },
    onError: async (e) => setNote({ tone: 'error', text: await errorMessage(e) }),
  });

  const data = status.data;
  const scheduled = data?.request ?? null;

  return (
    <section aria-labelledby="account-privacy" className="space-y-4 border-t border-border/20 pt-6">
      <h2 id="account-privacy" className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        Your data and account
      </h2>

      {scheduled ? (
        <div className="rounded-xl border border-accent-red/40 bg-accent-red/10 p-4">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">You asked us to delete your account</p>
              <p className="mt-1 text-sm text-text-muted">
                Our team will delete it after {dayFormat.format(new Date(scheduled.scheduledFor))}. Everything works as normal until then. Withdraw any
                money in your wallet before that date.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => keep.mutate()}
            disabled={keep.isPending}
            className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {keep.isPending ? 'Keeping your account…' : 'Keep my account'}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          <h3 className="mb-1 text-base font-medium text-text-primary">Download your data</h3>
          <p className="text-sm leading-tight text-text-muted">A copy of everything stored about you, as one file</p>
        </div>
        <button type="button" onClick={() => download.mutate()} disabled={download.isPending} className={rowButton}>
          {download.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {download.isPending ? 'Preparing…' : 'Download'}
        </button>
      </div>

      {!scheduled ? (
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="min-w-0">
            <h3 className="mb-1 text-base font-medium text-text-primary">Delete account</h3>
            <p className="text-sm leading-tight text-text-muted">
              Ask our team to permanently delete your account{data ? `. You have ${data.graceDays} days to change your mind` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNote(null);
              setDialog(true);
            }}
            disabled={!data || !data.available}
            className={`${rowButton} border-accent-red/40 text-accent-red hover:bg-accent-red/10`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Request
          </button>
        </div>
      ) : null}

      {data && !data.available ? <p className="text-sm text-text-muted">Account deletion is unavailable right now. Please try again later.</p> : null}
      {status.isError ? <p className="text-sm text-text-muted">Couldn’t load your account status. Refresh to try again.</p> : null}

      {note ? (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm ${note.tone === 'ok' ? 'bg-white/5 text-white' : 'border border-accent-red/40 bg-accent-red/10 text-white'}`}>
          {note.text}
        </p>
      ) : null}

      <AnimatePresence>
        {dialog && data ? (
          <DeleteAccountDialog
            graceDays={data.graceDays}
            needsPassword={data.needsPassword}
            onClose={() => setDialog(false)}
            onDownloadData={() => download.mutate()}
            onRequested={(request) => {
              queryClient.setQueryData<DeletionStatus>(accountKeys.deletion, (old) => (old ? { ...old, request } : old));
              setDialog(false);
              setNote({ tone: 'ok', text: 'Request received. We’ve emailed you the details.' });
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
