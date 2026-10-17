'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { motion, useMotionTemplate, useSpring, useReducedMotion, AnimatePresence } from 'motion/react'
import type { Product } from '@/store/useCartStore'
import { calculateDiscount } from '@/store/useCartStore'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'

/** Interactive gallery: touch-swipeable on mobile, interactive 3D tilt on desktop, with thumbnail navigation. */
export function TiltImage({ product }: { product: Product }) {
  const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []
  const [activeIdx, setActiveIdx] = useState(0)
  const discount = calculateDiscount(product.price, product.cutPrice)

  // 3D desktop tilt
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

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Horizontal swipe must be stronger than vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0 && activeIdx < images.length - 1) {
        setActiveIdx((prev) => prev + 1)
      } else if (deltaX > 0 && activeIdx > 0) {
        setActiveIdx((prev) => prev - 1)
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const nextImage = () => {
    setActiveIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
  }

  const currentImage = images[activeIdx] || product.image

  return (
    <div className="enter flex flex-col gap-4" style={{ perspective: 1200, animationDelay: '40ms' }}>
      {/* Main Image Stage */}
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ transform, transformStyle: 'preserve-3d' }}
        className="group relative aspect-square overflow-hidden rounded-[32px] bg-surface-2 ring-1 ring-primary/20 shadow-md dark:ring-primary/25 touch-pan-y"
      >
        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.div
              key={currentImage}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.4 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 h-full w-full"
            >
              <Image
                src={currentImage}
                alt={`${product.name} photo ${activeIdx + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <span className="grid h-full w-full place-items-center text-muted">No photo yet</span>
          )}
        </AnimatePresence>

        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,transparent_35%)]" />

        {/* Attention-Grabbing Discount Badge (Reference Image Match) */}
        {discount > 0 && (
          <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-emerald-600/95 px-3 py-1 text-[12px] font-bold tracking-tight text-white shadow-md backdrop-blur-xs ring-1 ring-white/30 animate-pulse">
            <span>{discount}% OFF</span>
          </div>
        )}

        {/* Sold out Badge */}
        {product.isOutOfStock && (
          <div className="glass absolute left-4 top-4 z-10 rounded-full px-3.5 py-1 text-[12px] font-medium text-foreground">
            Sold out for now
          </div>
        )}

        {/* Image Counter Badge if multiple */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11.5px] font-medium text-white shadow-xs">
            <Images className="h-3.5 w-3.5" />
            <span>
              {activeIdx + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Desktop Prev/Next Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="press absolute left-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-surface/85 backdrop-blur-md text-foreground shadow-md opacity-80 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="press absolute right-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-surface/85 backdrop-blur-md text-foreground shadow-md opacity-80 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </motion.div>

      {/* Swipe Hint on Mobile / Thumbnails Carousel */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`View photo ${i + 1}`}
                className={`press relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                  activeIdx === i
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-line opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
          <span className="text-[12px] text-muted text-center tracking-tight">
            👈 Swipe or tap thumbnails to view all photos
          </span>
        </div>
      )}
    </div>
  )
}
