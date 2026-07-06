"use client"
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMeetingStore } from '@/store/meetingStore'
import { getLiveClass } from '@/services/liveClassService'
import CreatorCredentials from './components/CreatorCredentials'
import ObsInstructions from './components/ObsInstructions'
import ClassDetails from './components/ClassDetails'
import AttendeeManager from './components/AttendeeManager'
import PreviewPlayer from './components/PreviewPlayer'

export default function CreatorLiveDashboardPage() {
  const params = useParams()
  const id = params.id as string
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const setCurrentLiveClass = useMeetingStore((s) => s.setCurrentLiveClass)
  const setPlaybackUrl = useMeetingStore((s) => s.setPlaybackUrl)
  const liveClass = useMeetingStore((s) => s.currentLiveClass)
  const playbackUrl = useMeetingStore((s) => s.playbackUrl)

  const derivedPlayback = useMemo(() => {
    if (liveClass?.playback_url) return liveClass.playback_url
    if (liveClass?.mux_playback_id) return `https://stream.mux.com/${liveClass.mux_playback_id}.m3u8`
    return playbackUrl
  }, [liveClass, playbackUrl])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setError(null)
      try {
        const lc = await getLiveClass(id)
        if (!mounted) return
        setCurrentLiveClass(lc)
        setPlaybackUrl(lc.playback_url ?? (lc.mux_playback_id ? `https://stream.mux.com/${lc.mux_playback_id}.m3u8` : null))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load class')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 5000)
    return () => { mounted = false; clearInterval(t) }
  }, [id, setCurrentLiveClass, setPlaybackUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Loading…</div>
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

  if (!liveClass) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Class Not Found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8">
          <div className="flex flex-col gap-6">
            <PreviewPlayer src={derivedPlayback ?? null} />
            <ObsInstructions />
            <AttendeeManager id={id} />
          </div>
          <div className="flex flex-col gap-6">
            <CreatorCredentials liveClass={liveClass} />
            <ClassDetails liveClass={liveClass} />
          </div>
        </div>
      </div>
    </div>
  )
}