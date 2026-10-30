'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import { clearPortalToken, getPortalToken, PORTAL_ROLES, setPortalToken } from '@/lib/emailPortalSession';
import { emailPortalService, portalErrorMessage } from '@/services/emailPortalService';
import { inputClass, primaryButton } from '@/components/email-portal/ui';

export default function EmailPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getPortalToken()) router.replace('/email-portal');
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { token, user } = await emailPortalService.login(email.trim(), password);

      if (!user.role || !PORTAL_ROLES.includes(user.role)) {
        clearPortalToken();
        setError('This account does not have access to the email portal.');
        return;
      }

      setPortalToken(token);
      router.replace('/email-portal');
    } catch (err) {
      setError(portalErrorMessage(err, 'Could not sign in. Please check your details and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Mail size={22} />
          </span>
          <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-3xl font-bold text-transparent">Email Portal</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to write and send emails to Hallos users.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div>
            <label htmlFor="portal-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Email
            </label>
            <input
              id="portal-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@hallos.net"
            />
          </div>

          <div>
            <label htmlFor="portal-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                id="portal-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="Your password"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className={`${primaryButton} w-full`}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">Restricted area. Access is limited to the Hallos content team.</p>
      </div>
    </div>
  );
}
