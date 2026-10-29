"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getLiveClass } from '@/services/liveClassService'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { isLegacyLiveClass } from '@/lib/live/providers'

type PageState = 'loading' | 'legacy' | 'not-found' | 'error'

/**
 * /live/:id is a stable entry link (shared links, cards, purchases). It
 * forwards to the class lobby, which handles paying, registering and joining.
 * Classes created with the retired Mux/OBS streaming get a short notice.
 */
export default function LiveClassPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user, loading: userLoading } = useCurrentUser()
  const [state, setState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userLoading) return
    if (!user) {
      router.replace(`/signin?redirect=/live/${id}`)
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
  }, [id, user, userLoading, router])

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
