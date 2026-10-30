'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CheckCircle, FilePlus2, Info, LogOut, Mail, Megaphone, XCircle } from 'lucide-react';
import { clearPortalToken, getPortalToken } from '@/lib/emailPortalSession';
import { emailPortalService } from '@/services/emailPortalService';
import type { PortalUser } from '@/types/emailPortal';
import { Spinner } from './ui';

type ToastType = 'success' | 'error' | 'info';

interface PortalContextValue {
  me: PortalUser;
  logout: () => void;
  notify: (message: string, type?: ToastType) => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export const usePortal = () => {
  const value = useContext(PortalContext);
  if (!value) throw new Error('usePortal must be used inside the email portal');
  return value;
};

const LOGIN_PATH = '/email-portal/login';

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 text-emerald-300',
  error: 'border-rose-500/30 text-rose-300',
  info: 'border-blue-500/30 text-blue-300',
};

const TOAST_ICONS = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

export default function PortalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === LOGIN_PATH;

  const [me, setMe] = useState<PortalUser | null>(null);
  const [checking, setChecking] = useState(!isLogin);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const logout = useCallback(() => {
    clearPortalToken();
    setMe(null);
    router.replace(LOGIN_PATH);
  }, [router]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (isLogin) {
      setChecking(false);
      return;
    }
    if (me) return;

    if (!getPortalToken()) {
      router.replace(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    setChecking(true);
    emailPortalService
      .me()
      .then((user) => {
        if (!cancelled) setMe(user);
      })
      .catch(() => {
        if (cancelled) return;
        clearPortalToken();
        router.replace(LOGIN_PATH);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLogin, me, router]);

  const value = useMemo(() => (me ? { me, logout, notify } : null), [me, logout, notify]);

  const toastView = toast && (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 rounded-2xl border bg-zinc-900/95 px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur ${TOAST_STYLES[toast.type]}`}
    >
      {TOAST_ICONS[toast.type]}
      <span className="text-zinc-100">{toast.message}</span>
    </div>
  );

  if (isLogin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {children}
        {toastView}
      </div>
    );
  }

  if (checking || !value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Spinner label="Checking access..." />
      </div>
    );
  }

  const navLink = (href: string, label: string, icon: ReactNode, active: boolean) => (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-violet-600/15 text-violet-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <PortalContext.Provider value={value}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/email-portal" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Mail size={16} />
                </span>
                <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-lg font-bold text-transparent">
                  Email Portal
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                {navLink('/email-portal', 'Campaigns', <Megaphone size={16} />, pathname === '/email-portal' || pathname.startsWith('/email-portal/campaigns'))}
                {navLink('/email-portal/compose', 'New campaign', <FilePlus2 size={16} />, pathname.startsWith('/email-portal/compose'))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-zinc-200">
                  {me?.firstname} {me?.lastname}
                </p>
                <p className="text-[11px] text-zinc-500">Sending as {me?.sender.from}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        {toastView}
      </div>
    </PortalContext.Provider>
  );
}
