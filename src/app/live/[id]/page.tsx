"use client"
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMeetingStore } from '@/store/meetingStore'
import { useLocalMedia } from '@/hooks/useLocalMedia'
import LivePlayer from './components/LivePlayer'
import ClassMeta from './components/ClassMeta'
import RoleDisplay from './components/RoleDisplay'
import { Button } from '@/components/ui/Button'
import { getLiveClass, getPlaybackUrl, getHosts, getAttendees, addAttendee, type Host, type LiveClass } from '@/services/liveClassService'
import { useCurrentUser } from '@/hooks/useCurrentUser'

type Role = 'creator' | 'cohost' | 'attendee'

export default function LiveClassPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user, loading: userLoading, userId } = useCurrentUser()
  const [role, setRole] = useState<Role>('attendee')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Redirect unauthenticated users to signin once auth check is done
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace(`/signin?redirect=/live/${id}`)
    }
  }, [user, userLoading, id, router])

  const setCurrentLiveClass = useMeetingStore((s) => s.setCurrentLiveClass)
  const setPlaybackUrl = useMeetingStore((s) => s.setPlaybackUrl)
  const setHosts = useMeetingStore((s) => s.setHosts)
  const setAttendees = useMeetingStore((s) => s.setAttendees)
  const playbackUrl = useMeetingStore((s) => s.playbackUrl)
  const currentClass = useMeetingStore((s) => s.currentLiveClass)

  const { localStream, videoEnabled, requestCamera, toggleVideo } = useLocalMedia()
  const shareInvite = () => {
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')
    const link = `${base}/live/${id}`
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).catch(() => {})
    }
  }

  // Debug logging
  useEffect(() => {
    if (currentClass) {
      console.log('Viewer Page - Live Class Data:', {
        streamingProvider: currentClass.streamingProvider,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        streaming_provider: (currentClass as any).streaming_provider,
        fullClass: currentClass
      })
    }
  }, [currentClass])

  const detectRole = (hosts: Host[], uid?: string | number): Role => {
    if (!uid) return 'attendee'
    const mine = hosts.find((h) => String(h.userId) === String(uid))
    if (!mine) return 'attendee'
    return mine.role
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const lc = await getLiveClass(id)
        if (!mounted) return
        
        if (lc.isZegoCloud) {
          router.replace(`/live/join/${id}`)
          return
        }

        // Only fetch playback URL and other data for Mux streams
        const [pb, hs, at] = await Promise.all([
          getPlaybackUrl(id),
          getHosts(id),
          getAttendees(id),
        ])
        if (!mounted) return

        setCurrentLiveClass(lc)
        setPlaybackUrl(lc.playback_url ?? pb.playbackUrl)
        setHosts(hs.hosts)
        setAttendees(at.attendees)
        const r = detectRole(hs.hosts, userId)
        setRole(r)
        if (r === 'attendee' && userId) {
          const creator = hs.hosts.find((h) => h.role === 'creator')
          const inviter = creator?.userId ?? hs.hosts[0]?.userId
          try {
            await addAttendee(id, { userId, invitedBy: inviter, statusPaid: true })
            const at2 = await getAttendees(id)
            setAttendees(at2.attendees)
          } catch (e) {
            const msg = e instanceof Error ? e.message : ''
            if (/already exists/i.test(msg)) {
              const at2 = await getAttendees(id)
              setAttendees(at2.attendees)
            } else {
              setError(msg || 'Unable to join as attendee')
            }
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load class'
        if (/not found/i.test(msg)) setNotFound(true)
        else setError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id, userId, setCurrentLiveClass, setPlaybackUrl, setHosts, setAttendees, router])

  // For ZegoCloud: no playback URL needed (WebRTC). For RTMP/Mux: need playback URL (HLS)
  const isZegoCloud = useMemo(() => currentClass?.streamingProvider === 'zegocloud', [currentClass])
  const waiting = useMemo(() => {
    if (isZegoCloud) return false // ZegoCloud doesn't need playback URL
    return !playbackUrl // RTMP/Mux needs playback URL
  }, [isZegoCloud, playbackUrl])
  const isLive = useMemo(() => currentClass?.status === 'live', [currentClass])

  useEffect(() => {
    let active = true
    const interval = setInterval(async () => {
      if (!active) return
      try {
        const lc = await getLiveClass(id)
        if (!active) return
        setCurrentLiveClass(lc)
        
        // Only fetch playback URL for Mux streams, not ZegoCloud
        if (lc.streamingProvider !== 'zegocloud') {
          const pb = await getPlaybackUrl(id)
          setPlaybackUrl(pb.playbackUrl)
        }
      } catch {}
    }, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [id, setPlaybackUrl, setCurrentLiveClass])

  const refreshNow = async () => {
    setRefreshing(true)
    try {
      const lc = await getLiveClass(id)
      setCurrentLiveClass(lc)
      
      // Only fetch playback URL for Mux streams, not ZegoCloud
      if (lc.streamingProvider !== 'zegocloud') {
        const pb = await getPlaybackUrl(id)
        setPlaybackUrl(lc.playback_url ?? pb.playbackUrl)
      }
    } finally {
      setRefreshing(false)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    )
  }

  // Don't render anything while redirecting unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Redirecting to login...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Class Not Found</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8">
          <div className="flex flex-col gap-6">
            <LivePlayer
              src={playbackUrl ?? null}
              muted={role !== 'attendee'}
              controls={role === 'attendee'}
              className="w-full min-h-[300px] bg-black rounded-xl"
            />
            <div className="flex items-center gap-4">
              {isLive && (
                <span className="text-sm text-text-primary/90 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-red" /> Live
                </span>
              )}
              {waiting && !isZegoCloud && <span className="text-sm text-text-primary/80">Waiting for host to go live</span>}
              {waiting && !isZegoCloud && (
                <Button variant="secondary" onClick={refreshNow} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh status'}</Button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:min-w-[320px]">
            <RoleDisplay role={role} streamKey={(useMeetingStore.getState().currentLiveClass as LiveClass | null)?.mux_stream_key} rtmpUrl={(useMeetingStore.getState().currentLiveClass as LiveClass | null)?.mux_rtmp_url} />
            {(role === 'creator' || role === 'cohost') && (
              <div className="flex flex-col gap-2">
                {!localStream && (
                  <Button variant="secondary" onClick={requestCamera}>Enable Camera</Button>
                )}
                {localStream && (
                  <Button variant="secondary" onClick={toggleVideo}>{videoEnabled ? 'Turn Video Off' : 'Turn Video On'}</Button>
                )}
                <Button variant="secondary" onClick={shareInvite}>Share Invite</Button>
              </div>
            )}
            {(useMeetingStore.getState().currentLiveClass as LiveClass | null) && (
              <ClassMeta liveClass={useMeetingStore.getState().currentLiveClass as LiveClass} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}