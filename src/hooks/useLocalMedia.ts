import { useCallback, useEffect, useState } from 'react'
import { useMeetingStore } from '@/store/meetingStore'

export function useLocalMedia() {
  const localStream = useMeetingStore((s) => s.localStream)
  const videoEnabled = useMeetingStore((s) => s.videoEnabled)
  const setLocalStream = useMeetingStore((s) => s.setLocalStream)
  const setVideoEnabled = useMeetingStore((s) => s.setVideoEnabled)
  const [error, setError] = useState<Error | null>(null)

  const requestCamera = useCallback(async () => {
    setError(null)
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setLocalStream(stream)
      setVideoEnabled(true)
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Failed to access camera')
      setError(err)
    }
  }, [setLocalStream, setVideoEnabled])

  const enableVideo = useCallback(() => {
    setVideoEnabled(true)
    localStream?.getVideoTracks().forEach((t) => (t.enabled = true))
  }, [localStream, setVideoEnabled])

  const disableVideo = useCallback(() => {
    setVideoEnabled(false)
    localStream?.getVideoTracks().forEach((t) => (t.enabled = false))
  }, [localStream, setVideoEnabled])

  const toggleVideo = useCallback(() => {
    if (videoEnabled) {
      disableVideo()
    } else {
      enableVideo()
    }
  }, [videoEnabled, enableVideo, disableVideo])

  useEffect(() => {
    return () => {
      const s = useMeetingStore.getState().localStream
      s?.getTracks().forEach((t) => t.stop())
      useMeetingStore.getState().setLocalStream(null)
      useMeetingStore.getState().setVideoEnabled(false)
    }
  }, [])

  return {
    localStream,
    videoEnabled,
    error,
    requestCamera,
    toggleVideo,
    enableVideo,
    disableVideo,
  }
}