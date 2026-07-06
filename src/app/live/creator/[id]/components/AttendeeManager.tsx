"use client"
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { addAttendee as addAttendeeToClass, getAttendees, type ParticipantEntry } from '@/services/liveClassService'
import { useMeetingStore } from '@/store/meetingStore'

export default function AttendeeManager({ id }: { id: string }) {
  const [participants, setParticipants] = useState<ParticipantEntry[]>([])
  const [newUserId, setNewUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentClass = useMeetingStore((s) => s.currentLiveClass)

  const load = useCallback(async () => {
    setError(null)
    try {
      const at = await getAttendees(id)
      const mapped: ParticipantEntry[] = (at.attendees || []).map((a) => ({ id: String(a.id), userId: a.userId, role: 'attendee', statusPaid: a.statusPaid }))
      setParticipants(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load attendees')
    }
  }, [id])

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [load])

  const handleAddAttendee = async () => {
    if (!newUserId.trim()) return
    setLoading(true)
    setError(null)
    try {
      await addAttendeeToClass(id, { userId: newUserId, invitedBy: currentClass?.userId, statusPaid: true })
      setNewUserId('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add attendee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/10 p-4 flex flex-col gap-3">
      <div className="text-base font-semibold text-text-primary">Attendees</div>
      <div className="flex gap-2">
        <input className="auth-input flex-1" placeholder="Attendee userId" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
        <Button variant="secondary" onClick={handleAddAttendee} disabled={loading}>{loading ? 'Adding…' : 'Add'}</Button>
      </div>
      {error && <div className="text-accent-red text-sm">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-primary/70">
              <th className="py-2 pr-4">User ID</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Paid</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={String(p.id)} className="border-t border-border/10 text-text-primary">
                <td className="py-2 pr-4">{String(p.userId)}</td>
                <td className="py-2 pr-4">{p.role || 'attendee'}</td>
                <td className="py-2 pr-4">{p.statusPaid ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}