"use client"
import { useEffect, useRef } from 'react'
import { useMeetingStore } from '@/store/meetingStore'

interface RoleDisplayProps {
  role: 'creator' | 'cohost' | 'attendee'
  streamKey?: string
  rtmpUrl?: string
}

export default function RoleDisplay({ role, streamKey, rtmpUrl }: RoleDisplayProps) {
  const localStream = useMeetingStore((s) => s.localStream)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (localStream) {
      el.srcObject = localStream
      el.play().catch(() => {})
    } else {
      el.srcObject = null
    }
  }, [localStream])

  if (role === 'attendee') return null
  return (
    <div className="flex flex-col gap-4">
      {role === 'creator' && (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-text-primary">OBS Connection</div>
          <div className="text-xs text-text-primary/80">RTMP URL: {rtmpUrl || '-'}</div>
          <div className="text-xs text-text-primary/80">Stream Key: {streamKey || '-'}</div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-text-primary">Camera Preview</div>
        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black min-h-[160px]" />
      </div>
    </div>
  )
}