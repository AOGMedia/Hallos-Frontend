"use client"
import { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

function NotFoundInner() {
  const [shapes, setShapes] = useState<Array<{ id: number; size: number; x: number; y: number; delay: number; duration: number; hue: number; alpha: number }>>([])

  useEffect(() => {
    const arr = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: 60 + Math.round(Math.random() * 120),
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 6 + Math.random() * 6,
      hue: 200 + Math.round(Math.random() * 160),
      alpha: 0.12 + Math.random() * 0.18,
    }))
    setShapes(arr)
  }, [])

  return (
    <div className="min-h-screen bg-background-darker relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" suppressHydrationWarning>
        {shapes.map(s => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: `${s.x}%`, y: `${s.y}%`, scale: 0.8 }}
            animate={{ opacity: s.alpha, y: [`${s.y}%`, `${(s.y + 10) % 100}%`, `${s.y}%`], scale: [0.8, 1.05, 0.8] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full absolute"
            style={{ width: s.size, height: s.size, background: `radial-gradient(circle, hsla(${s.hue}, 65%, 60%, ${s.alpha}) 0%, transparent 60%)` }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto max-w-3xl px-6 py-24 md:py-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center gap-6">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.02, 1] }} transition={{ duration: 0.8, ease: 'easeOut' }} className="relative">
            <div className="text-[72px] md:text-[120px] font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,#EAEAEA,rgba(234,234,234,0.5))]">
              404
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ duration: 1 }} className="absolute inset-0 blur-2xl" />
          </motion.div>
          <div className="text-text-primary text-xl md:text-2xl">
            Page not found
          </div>
          <div className="text-text-primary/70 max-w-xl">
            The page you are looking for doesn&apos;t exist or was moved.
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <Link href="/dashboard">
              <Button variant="primary">Back to dashboard</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default memo(NotFoundInner)