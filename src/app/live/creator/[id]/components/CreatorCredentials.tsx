"use client"
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check, Copy } from 'lucide-react'
import type { LiveClass } from '@/services/liveClassService'

export default function CreatorCredentials({ liveClass }: { liveClass: LiveClass }) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const isZegoCloud = useMemo(() => liveClass.streamingProvider === 'zegocloud', [liveClass])
  
  // Generate invite link for ZegoCloud
  const inviteLink = useMemo(() => {
    if (!isZegoCloud) return null
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || ''
    return `${baseUrl}/live/${liveClass.id}`
  }, [isZegoCloud, liveClass.id])

  // RTMP/OBS credentials
  const rtmp = useMemo(() => liveClass.rtmp_url || liveClass.mux_rtmp_url || '-', [liveClass])
  const key = useMemo(() => liveClass.stream_key || liveClass.mux_stream_key || '-', [liveClass])
  const playback = useMemo(() => {
    if (liveClass.playback_url) return liveClass.playback_url
    if (liveClass.mux_playback_id) return `https://stream.mux.com/${liveClass.mux_playback_id}.m3u8`
    return '-'
  }, [liveClass])

  const copy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // ZegoCloud: Show invite link only (Prebuilt UI pattern)
  if (isZegoCloud) {
    return (
      <div className="rounded-xl border border-border/10 p-4 flex flex-col gap-3">
        <div className="text-base font-semibold text-text-primary">Invite Participants</div>
        
        {/* Invite Link */}
        {inviteLink && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-primary/60 font-medium">Share this link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-background-dark/50 rounded-lg border border-border/10 text-sm text-text-primary/90 truncate font-mono">
                {inviteLink}
              </div>
              <Button 
                variant="secondary" 
                onClick={() => copy(inviteLink, 'invite')}
                className="shrink-0"
              >
                {copiedField === 'invite' ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Room ID (informational only) */}
        {liveClass.zego_room_id && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-primary/60 font-medium">Room ID</label>
            <div className="px-3 py-2 bg-background-dark/30 rounded-lg text-sm text-text-primary/70 font-mono">
              {liveClass.zego_room_id}
            </div>
          </div>
        )}

        {/* Helper text */}
        <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-text-primary">
            ✨ <strong>Browser-Based Streaming:</strong> Participants will join via their browser. No app or OBS required.
          </p>
        </div>
      </div>
    )
  }

  // RTMP/OBS: Show traditional credentials
  return (
    <div className="rounded-xl border border-border/10 p-4 flex flex-col gap-3">
      <div className="text-base font-semibold text-text-primary">OBS Streaming Credentials</div>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs text-text-primary/60 font-medium">RTMP Server URL</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-background-dark/50 rounded-lg border border-border/10 text-sm text-text-primary/90 truncate font-mono">
            {rtmp}
          </div>
          <Button 
            variant="secondary" 
            onClick={() => copy(String(rtmp), 'rtmp')}
            className="shrink-0"
          >
            {copiedField === 'rtmp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-text-primary/60 font-medium">Stream Key</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-background-dark/50 rounded-lg border border-border/10 text-sm text-text-primary/90 truncate font-mono">
            {key}
          </div>
          <Button 
            variant="secondary" 
            onClick={() => copy(String(key), 'key')}
            className="shrink-0"
          >
            {copiedField === 'key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-text-primary/60 font-medium">Playback URL</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-background-dark/50 rounded-lg border border-border/10 text-sm text-text-primary/90 truncate font-mono">
            {playback}
          </div>
          <Button 
            variant="secondary" 
            onClick={() => copy(String(playback), 'playback')}
            className="shrink-0"
          >
            {copiedField === 'playback' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}