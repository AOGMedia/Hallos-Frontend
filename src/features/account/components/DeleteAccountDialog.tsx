'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { accountApi, errorMessage, type DeletionRequest } from '../api';

const REASONS = ['I don’t use Hallos any more', 'I have another account', 'Privacy concerns', 'Too many emails', 'Something else'];

interface DeleteAccountDialogProps {
  graceDays: number;
  needsPassword: boolean;
  onClose: () => void;
  onRequested: (request: DeletionRequest) => void;
  onDownloadData: () => void;
}

/**
 * Asking our team to delete the account. People can only request it; the
 * team deletes it after the grace period. Says plainly what happens, then
 * confirms with the password, or by typing DELETE for Google sign-ins.
 */
export function DeleteAccountDialog({ graceDays, needsPassword, onClose, onRequested, onDownloadData }: DeleteAccountDialogProps) {
  const titleId = useId();
  const [reason, setReason] = useState('');
  const [secret, setSecret] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [busy, onClose]);

  const ready = needsPassword ? secret.length > 0 : secret.trim().toUpperCase() === 'DELETE';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const request = await accountApi.requestDeletion({
        ...(needsPassword ? { password: secret } : { confirmText: secret.trim() }),
        reason: reason || undefined,
      });
      onRequested(request);
    } catch (e) {
      setError(await errorMessage(e));
      input.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={busy ? undefined : onClose}
      />
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-background-darker shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-white">Request account deletion</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-50">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 text-sm text-text-muted">
          <ul className="space-y-2.5">
            <li>
              <span className="font-medium text-white">This sends a request to our team.</span> Nothing is deleted straight away: you have {graceDays} days
              to change your mind, and your account works as normal until then. After that, our team deletes it.
            </li>
            <li>
              <span className="font-medium text-white">Withdraw any money first.</span> We can’t delete an account that still has a wallet balance or a payout
              on the way.
            </li>
            <li>
              <span className="font-medium text-white">After that it’s permanent.</span> Your profile, name, email and sign-in are removed. Payment records are
              kept only where the law requires, without your details.
            </li>
          </ul>
          <p>
            Want a copy of your data?{' '}
            <button type="button" onClick={onDownloadData} className="font-medium text-primary underline-offset-4 hover:underline">
              Download it first
            </button>
            .
          </p>

          <label className="block">
            <span className="mb-2 block text-white">Why are you leaving? (optional)</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
              className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-3 text-white focus:border-gray-400 focus:outline-none"
            >
              <option value="">Choose a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-white">{needsPassword ? 'Enter your password to confirm' : 'Type DELETE to confirm'}</span>
            <span className="relative block">
              <input
                ref={input}
                type={needsPassword && !show ? 'password' : 'text'}
                autoComplete={needsPassword ? 'current-password' : 'off'}
                autoCapitalize="characters"
                value={secret}
                onChange={(e) => {
                  setSecret(e.target.value);
                  setError(null);
                }}
                disabled={busy}
                placeholder={needsPassword ? 'Password' : 'DELETE'}
                aria-invalid={Boolean(error)}
                className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-3 pr-12 text-white placeholder:text-gray-500 focus:border-gray-400 focus:outline-none disabled:opacity-50"
              />
              {needsPassword ? (
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/60 hover:text-white"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : null}
            </span>
          </label>

          {error ? (
            <p role="alert" className="rounded-lg border border-accent-red/40 bg-accent-red/10 px-3 py-2 text-sm text-white">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-full border border-white/15 px-5 py-3 font-medium text-white hover:bg-white/5 disabled:opacity-50">
            Keep my account
          </button>
          <button
            type="submit"
            disabled={!ready || busy}
            className="flex items-center justify-center gap-2 rounded-full bg-accent-red px-5 py-3 font-medium text-white transition-colors hover:bg-accent-red/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden /> : null}
            {busy ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
