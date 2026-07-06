import { useMutation, useQuery } from '@tanstack/react-query'
// import { createLiveClass, getLiveClass, getLivePlaybackUrl, addHost, addAttendee, listHosts, listAttendees, type CreateLiveClassBody, type CreateLiveClassResponse } from '@/lib/api/live'
import { createLiveClass, getLiveClass, getLivePlaybackUrl, addHost, addAttendee, listHosts, listAttendees, getMyLiveClasses, type CreateLiveClassBody, type CreateLiveClassResponse } from '@/lib/api/live'

export function useCreateLiveClass() {
  return useMutation<CreateLiveClassResponse, unknown, CreateLiveClassBody>({
    mutationFn: async (body) => {
      return await createLiveClass(body)
    },
  })
}

export function useGetLiveClass(id: string, enabled = true) {
  return useQuery({
    queryKey: ['live', 'class', id],
    queryFn: async () => await getLiveClass(id),
    enabled: !!id && enabled,
  })
}

export function useLivePlayback(id: string, enabled = true) {
  return useQuery({
    queryKey: ['live', 'playback', id],
    queryFn: async () => await getLivePlaybackUrl(id),
    enabled: !!id && enabled,
    refetchInterval: 5000,
  })
}

export function useAddHost() {
  return useMutation<{ success: boolean; host?: unknown; message?: string }, unknown, { id: string; userId: number | string; role?: 'creator' | 'cohost' }>({
    mutationFn: async ({ id, userId, role }) => await addHost(id, { userId, role }),
  })
}

export function useAddAttendee() {
  return useMutation<{ success: boolean; attendee?: unknown; message?: string }, unknown, { id: string; userId: number | string; invitedBy?: number | string; statusPaid?: boolean }>({
    mutationFn: async ({ id, userId, invitedBy, statusPaid }) => await addAttendee(id, { userId, invitedBy, statusPaid }),
  })
}

export function useListHosts(id: string, enabled = true) {
  return useQuery({
    queryKey: ['live', 'hosts', id],
    queryFn: async () => await listHosts(id),
    enabled: !!id && enabled,
  })
}

export function useListAttendees(id: string, enabled = true) {
  return useQuery({
    queryKey: ['live', 'attendees', id],
    queryFn: async () => await listAttendees(id),
    enabled: !!id && enabled,
  })
}

export function useGetMyLiveClasses() {
  return useQuery({
    queryKey: ['live', 'my-classes'],
    queryFn: async () => await getMyLiveClasses(),
  })
}