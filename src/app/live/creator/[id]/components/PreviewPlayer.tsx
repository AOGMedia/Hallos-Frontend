"use client"
import LivePlayer from '@/app/live/[id]/components/LivePlayer'

export default function PreviewPlayer({ src }: { src: string | null }) {
  return (
    <div className="rounded-xl border border-border/10 p-2">
      <LivePlayer src={src} muted={true} controls={true} />
    </div>
  )
}