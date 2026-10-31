"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getLiveClass } from '@/services/liveClassService'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { isLegacyLiveClass } from '@/lib/live/providers'
import { buttonClasses } from '@/components/ui/Button'
import { LiveClassPreview } from '@/components/live/public/LiveClassPreview'
import type { PublicLiveClass } from '@/lib/seo/publicApi'

type PageState = 'loading' | 'legacy' | 'not-found' | 'error'

/**
 * /live/:id is a stable entry link (shared links, cards, purchases).
 *
 * Signed-in users: unchanged — forwarded to the class lobby (/live/join/:id),
 * which handles paying, registering and joining. Legacy Mux/OBS classes get
 * a short notice.
 *
 * Visitors: a public class shows a preview with sign-in / sign-up buttons
 * that return here. Private or unavailable classes keep the old behaviour
 * (straight to sign-in).
 */
export default function LiveClassEntry({ id, preview }: { id: string; preview: PublicLiveClass | null }) {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [state, setState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)

  // The server only sends a preview for public classes.
  const showPreview = !!preview
  const returnTo = `/live/${id}`

  useEffect(() => {
    if (userLoading) return
    if (!user) {
      if (!showPreview) router.replace(`/signin?redirect=${returnTo}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const lc = await getLiveClass(id)
        if (!mounted) return
        if (isLegacyLiveClass(lc)) {
          setState('legacy')
          return
        }
        router.replace(`/live/join/${id}`)
      } catch (e) {
        if (!mounted) return
        const msg = e instanceof Error ? e.message : 'Failed to load class'
        if (/not found/i.test(msg)) {
          setState('not-found')
        } else {
          setError(msg)
          setState('error')
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [id, user, userLoading, router, showPreview, returnTo])

  const message =
    state === 'legacy'
      ? 'This class used a streaming method that is no longer supported.'
      : state === 'not-found'
        ? 'Class Not Found'
        : state === 'error'
          ? error
          : !userLoading && !user
            ? 'Redirecting to login...'
            : 'Loading...'

  if (preview) {
    return (
      <div className="bg-background-darker">
        <LiveClassPreview
          liveClass={preview}
          actions={<PreviewActions id={id} returnTo={returnTo} isLegacy={preview.isLegacy} userLoading={userLoading} signedIn={!!user} state={state} message={message} />}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-darker flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-text-primary">{message}</div>
      {(state === 'legacy' || state === 'not-found') && (
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      )}
    </div>
  )
}

function PreviewActions({
  id,
  returnTo,
  isLegacy,
  userLoading,
  signedIn,
  state,
  message,
}: {
  id: string
  returnTo: string
  isLegacy: boolean
  userLoading: boolean
  signedIn: boolean
  state: PageState
  message: string | null
}) {
  if (isLegacy || state === 'legacy') {
    return <p className="text-text-primary">This class used a streaming method that is no longer supported.</p>
  }

  if (userLoading || (signedIn && state === 'loading')) {
    return <p className="text-text-secondary">Opening class…</p>
  }

  if (signedIn) {
    // Signed in but the lobby couldn't be opened (not found / error).
    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-primary">{message}</p>
        <Link href={`/live/join/${id}`} className="text-sm text-accent-cyan hover:underline">
          Try opening the class again
        </Link>
      </div>
    )
  }

  const redirect = encodeURIComponent(returnTo)
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-text-secondary text-sm">Sign in to register, pay and join this class.</p>
      <div className="flex flex-wrap gap-3">
        <Link href={`/signin?redirect=${redirect}`} className={buttonClasses({ variant: 'primary', className: 'text-center' })}>
          Sign in to join
        </Link>
        <Link href={`/signup?redirect=${redirect}`} className={buttonClasses({ variant: 'outline', className: 'text-center' })}>
          Create free account
        </Link>
      </div>
    </div>
  )
}
