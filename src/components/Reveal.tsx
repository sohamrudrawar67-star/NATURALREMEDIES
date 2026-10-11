'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Fades + rises once when scrolled into view. CSS transition, so it never fights the main thread. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out)] motion-reduce:transform-none motion-reduce:filter-none',
        shown ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-[3px]',
        className
      )}
    >
      {children}
    </div>
  )
}
