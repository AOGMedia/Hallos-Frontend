"use client"
import type { LiveClass } from '@/services/liveClassService'

interface ClassMetaProps {
  liveClass: LiveClass
}

export default function ClassMeta({ liveClass }: ClassMetaProps) {
  const status = liveClass.status || 'scheduled'
  const color = status === 'live' ? 'bg-accent-red text-white' : status === 'recorded' ? 'bg-[#2d2f36] text-white' : status === 'ended' ? 'bg-[#2d2f36] text-white' : 'bg-[#2d2f36] text-white'
  return (
    <div className="flex flex-col gap-3 text-text-primary">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{liveClass.title}</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{status}</span>
      </div>
      {liveClass.description && <p className="text-sm opacity-80">{liveClass.description}</p>}
      {liveClass.startTime && <div className="text-sm opacity-80">Starts: {new Date(liveClass.startTime).toLocaleString()}</div>}
      {liveClass.endTime && <div className="text-sm opacity-80">Ends: {new Date(liveClass.endTime).toLocaleString()}</div>}
    </div>
  )
}