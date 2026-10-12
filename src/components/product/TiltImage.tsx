'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useMotionTemplate, useSpring, useReducedMotion } from 'motion/react'
import type { Product } from '@/store/useCartStore'

/** Tilts toward the pointer on a spring — decorative, so it's allowed to have a little life. */
export function TiltImage({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const rx = useSpring(0, { stiffness: 150, damping: 18 })
  const ry = useSpring(0, { stiffness: 150, damping: 18 })
  const transform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg)`

  const onMove = (e: React.PointerEvent) => {
    if (reduceMotion || e.pointerType !== 'mouse') return
    const r = ref.current!.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 8)
    rx.set(-py * 8)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div className="enter" style={{ perspective: 1200, animationDelay: '40ms' }}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ transform, transformStyle: 'preserve-3d' }}
        className="relative aspect-square overflow-hidden rounded-[32px] bg-surface-2 ring-1 ring-primary/20 shadow-sm dark:ring-primary/25"
      >
        {product.image ? (
          <Image src={product.image} alt={product.name} fill preload sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted">No photo yet</span>
        )}
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,transparent_35%)]" />
      </motion.div>
    </div>
  )
}
