"use client"
import { useEffect, useRef } from 'react'
import Hls from 'hls.js'


interface LivePlayerProps {
  src: string | null
  muted?: boolean
  controls?: boolean
  poster?: string
  className?: string
}

export default function LivePlayer({
  src,
  muted = true,
  controls = true,
  poster,
  className,
}: LivePlayerProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return
    
    const isHls = /\.m3u8(\?|$)/.test(src)
    if (!isHls) {
      el.src = src
      return
    }
    
    const canNative = el.canPlayType('application/vnd.apple.mpegurl')
    if (canNative) {
      el.src = src
      return
    }
    
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hls.loadSource(src)
      hls.attachMedia(el)
      return () => hls.destroy()
    }
  }, [src])

  return (
    <video 
      ref={ref} 
      autoPlay 
      playsInline 
      muted={muted} 
      controls={controls} 
      poster={poster} 
      className={className ?? 'w-full rounded-xl bg-black'} 
    />
  )
}