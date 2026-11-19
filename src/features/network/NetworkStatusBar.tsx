'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CloudOff, Hourglass, Loader2, SignalLow, Wifi, WifiOff, X, type LucideIcon } from 'lucide-react'
import { useNetworkStatus } from './useNetworkStatus'
import { getNetworkMonitor } from './networkStatus'
import type { NetworkState } from './networkMonitor'

/** Live rooms show their own reconnecting state; the bar stays out of the way there. */
const ROOM_PATHS = /^\/(live\/room\/|live\/[^/]+\/room|live\/host-zego\/|dashboard\/room\/)/

const DISMISS_KEY = 'hallos_slow_notice_dismissed'

type Notice = {
  key: string
  icon: LucideIcon
  tone: 'danger' | 'warn' | 'ok'
  title: string
  detail: string
  action?: 'retry' | 'dismiss'
}

function noticeFor(state: NetworkState): Notice | null {
  switch (state.status) {
    case 'offline':
      return {
        key: 'offline',
        icon: WifiOff,
        tone: 'danger',
        title: "You're offline",
        detail: 'Check your internet connection.',
        action: 'retry',
      }
    case 'unreachable':
      return {
        key: 'unreachable',
        icon: CloudOff,
        tone: 'danger',
        title: "Can't reach Hallos",
        detail: "Your internet is on. We'll keep retrying.",
        action: 'retry',
      }
    case 'slow':
      // Cause still being checked: wait rather than guess.
      if (!state.slowCause) return null
      return state.slowCause === 'server'
        ? {
            key: 'slow-server',
            icon: Hourglass,
            tone: 'warn',
            title: 'Hallos is a little slow right now',
            detail: "It's on our side. Things may take longer.",
            action: 'dismiss',
          }
        : {
            key: 'slow-network',
            icon: SignalLow,
            tone: 'warn',
            title: 'Your connection is slow',
            detail: 'Things may take a little longer.',
            action: 'dismiss',
          }
    default:
      return state.justReconnected
        ? { key: 'back', icon: Wifi, tone: 'ok', title: "You're back online", detail: 'Everything is up to date.' }
        : null
  }
}

const TONE = {
  danger: 'bg-accent-red/15 text-accent-red',
  warn: 'bg-primary/15 text-primary',
  ok: 'bg-[#1DBF53]/15 text-[#1DBF53]',
} as const

const readDismissed = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISS_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * Tells people when they're offline, on a slow connection, or can't reach
 * Hallos — and when they're back. Mounted once for the whole site.
 */
export function NetworkStatusBar() {
  const state = useNetworkStatus()
  const pathname = usePathname() || ''
  // Dismissed "slow" notices stay dismissed for this visit. Safe to read up
  // front: during hydration the status is always "online", so nothing shows yet.
  const [dismissed, setDismissed] = useState<string[]>(() => (typeof window === 'undefined' ? [] : readDismissed()))

  const notice = noticeFor(state)
  const visible = !!notice && !ROOM_PATHS.test(pathname) && !dismissed.includes(notice.key)

  const dismiss = (key: string) => {
    const next = [...dismissed, key]
    setDismissed(next)
    try {
      sessionStorage.setItem(DISMISS_KEY, JSON.stringify(next))
    } catch {
      // Storage blocked: it just won't be remembered.
    }
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-[calc(max(env(safe-area-inset-bottom),16px)+80px)] z-[70] flex justify-center sm:bottom-6"
      // Offline matters right away; the rest can wait for a pause.
      aria-live={notice?.tone === 'danger' ? 'assertive' : 'polite'}
      role="status"
    >
      {/* mode="wait": one message leaves before the next arrives, never two at once */}
      <AnimatePresence mode="wait">
        {visible && notice && (
          <motion.div
            key={notice.key}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-[#1F2636] px-3 py-2.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE[notice.tone]}`}>
              <notice.icon size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{notice.title}</p>
              <p className="line-clamp-2 text-xs text-text-muted">{notice.detail}</p>
            </div>
            {notice.action === 'retry' && (
              <button
                type="button"
                onClick={() => void getNetworkMonitor()?.recheck()}
                disabled={state.checking}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              >
                {state.checking && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                {state.checking ? 'Checking' : 'Try again'}
              </button>
            )}
            {notice.action === 'dismiss' && (
              <button
                type="button"
                onClick={() => dismiss(notice.key)}
                aria-label="Dismiss"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
