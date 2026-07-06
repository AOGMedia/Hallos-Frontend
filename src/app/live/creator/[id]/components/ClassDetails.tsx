"use client"
import { useCurrentUser } from '@/hooks/useCurrentUser'
import type { LiveClass } from '@/services/liveClassService'

export default function ClassDetails({ liveClass }: { liveClass: LiveClass }) {
  const { userFirstName, userLastName } = useCurrentUser()
  const username = [userFirstName, userLastName].filter(Boolean).join(' ') || undefined
  const starts = liveClass.startTime ? new Date(liveClass.startTime).toLocaleString() : '-'
  const ends = liveClass.endTime ? new Date(liveClass.endTime).toLocaleString() : '-'
  const status = (liveClass.status ?? 'scheduled') as 'scheduled' | 'live' | 'ended' | 'recorded'
  const statusColor = status === 'live' ? 'bg-red-500' : status === 'recorded' ? 'bg-green-500' : status === 'ended' ? 'bg-gray-500' : 'bg-yellow-500'
  return (
    <div className="rounded-xl border border-border/10 p-4 flex flex-col gap-2">
      <div className="text-base font-semibold text-text-primary">Class Details</div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-sm text-text-primary/90 capitalize">{status}</span>
      </div>
      <div className="text-sm text-text-primary/90">Title: {liveClass.title}</div>
      {liveClass.description && <div className="text-sm text-text-primary/90">Description: {liveClass.description}</div>}
      <div className="text-sm text-text-primary/90">Starts: {starts}</div>
      <div className="text-sm text-text-primary/90">Ends: {ends}</div>
      {liveClass.userId && (
        <div className="text-sm text-text-primary/90">Creator: {username ?? String(liveClass.userId)}</div>
      )}
      {typeof liveClass.price !== 'undefined' && <div className="text-sm text-text-primary/90">Price: {String(liveClass.price)}</div>}
      {liveClass.privacy && <div className="text-sm text-text-primary/90">Privacy: {liveClass.privacy}</div>}
    </div>
  )
}