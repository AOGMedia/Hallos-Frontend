import { memo, useEffect, useRef } from 'react'

interface StreamVideoProps {
  stream: MediaStream
  className?: string
  muted?: boolean
}

export const StreamVideo = memo(function StreamVideo({ stream, className, muted = true }: StreamVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream
    }
  }, [stream])
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className ?? 'w-full h-full object-cover rounded-xl'}
    />
  )
})