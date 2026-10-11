'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Product, productHref } from '@/store/useCartStore'
import { CartQuantityButton } from '@/components/CartQuantityButton'
import { useCoarsePointer, useViewport } from '@/lib/useViewport'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/**
 * Pinned coverflow. Scrolling turns the shelf; the product in front gets the stage.
 * Each product gets ~70vh of scroll so it never feels rushed.
 */
export function ProductCoverflow({ products }: { products: Product[] }) {
  if (products.length === 0) return null
  return <ProductCoverflowInner products={products} />
}

function ProductCoverflowInner({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const count = products.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const { w, h, ready } = useViewport()
  const mobile = ready ? w < 768 : false

  // Silky-smooth spring interpolation for 60/120fps motion on touch and wheel
  const smooth = useSpring(scrollYProgress, { stiffness: 260, damping: 36, mass: 0.16, restDelta: 0.0005 })
  const progress = reduceMotion ? scrollYProgress : smooth

  // Hold the first and last product briefly at the ends of the pin
  const position = useTransform(progress, [0.06, 0.94], [0, Math.max(count - 1, 0)], {
    clamp: true,
  })

  const [active, setActive] = useState(0)
  useMotionValueEvent(position, 'change', (v) => {
    const next = Math.round(v)
    if (next !== active) setActive(next)
  })

  // Fit width, and leave room above/below for the title and the product details on short phones
  const byWidth = mobile ? Math.min(w * 0.62, 280) : Math.min(Math.max(w * 0.26, 280), 400)
  const cardW = Math.min(byWidth, (h * 0.42) / 1.2)

  const goTo = (i: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const scrollable = el.offsetHeight - window.innerHeight
    const p = count > 1 ? 0.06 + (i / (count - 1)) * 0.88 : 0
    window.scrollTo({ top: top + scrollable * p, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const current = products[Math.min(active, count - 1)]

  return (
    <section
      ref={ref}
      className="relative snap-start"
      style={{ height: mobile ? `${Math.max(count, 2) * 55 + 35}vh` : `${Math.max(count, 2) * 70 + 60}vh` }}
      aria-label="Products"
    >
      {/* Invisible snap stops on mobile so each swipe locks precisely to a product */}
      {mobile && (
        <div className="absolute inset-0 pointer-events-none">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="absolute h-px w-full snap-start"
              style={{ top: `${count > 1 ? (i / (count - 1)) * 88 : 0}%` }}
            />
          ))}
        </div>
      )}
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] px-6 pt-[max(13vh,5.5rem)] sm:pt-[15vh]">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-[clamp(32px,4.6vw,60px)] font-semibold leading-[1] tracking-[-0.04em]">
              The <em className="font-serif font-normal italic">shelf.</em>
            </h2>
            <div className="-mr-2 flex items-center pb-1" role="tablist" aria-label="Choose product">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={p.name}
                  onClick={() => goTo(i)}
                  className="press grid h-10 min-w-8 place-items-center px-1.5"
                >
                  <span
                    className="block h-1.5 rounded-full bg-foreground transition-[width,opacity] duration-300 ease-[var(--ease-out)]"
                    style={{ width: i === active ? 22 : 6, opacity: i === active ? 0.9 : 0.22 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 1600 }}>
          <div className="relative" style={{ width: cardW, height: cardW * 1.2, transformStyle: 'preserve-3d' }}>
            {products.map((p, i) => (
              <ShelfCard key={p.id} product={p} index={i} position={position} cardW={cardW} onSelect={() => goTo(i)} />
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[640px] px-6 pb-[max(5vh,1.5rem)] text-center sm:pb-[7vh]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, filter: 'blur(6px)', transform: 'translateY(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)', transform: 'translateY(-4px)', transition: { duration: 0.12 } }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="flex flex-col items-center"
            >
              <h3 className="text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.03em]">{current.name}</h3>
              {current.description && (
                <p className="mt-2 line-clamp-2 max-w-[44ch] text-pretty text-[15px] leading-[1.5] text-muted">
                  {current.description}
                </p>
              )}
              <div className="mt-5 flex items-center gap-4">
                <span className="text-[17px] font-medium tabular-nums">₹{current.price}</span>
                <CartQuantityButton product={current} />
                <Link href={productHref(current)} className="link-arrow hidden text-[14px] sm:inline-flex">
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function ShelfCard({
  product,
  index,
  position,
  cardW,
  onSelect,
}: {
  product: Product
  index: number
  position: MotionValue<number>
  cardW: number
  onSelect: () => void
}) {
  const transform = useTransform(position, (v) => {
    const d = index - v
    const a = Math.min(Math.abs(d), 2.4)
    const sign = Math.sign(d)
    // Neighbors tuck in behind and turn toward the center, like covers on a shelf
    const x = sign * (a < 1 ? a * cardW * 0.78 : cardW * 0.78 + (a - 1) * cardW * 0.42)
    const z = -a * 180
    const ry = -sign * Math.min(a, 1) * 42
    return `translate3d(${x}px, 0px, ${z}px) rotateY(${ry}deg)`
  })
  const opacity = useTransform(position, (v) => {
    const a = Math.abs(index - v)
    return a > 2.2 ? Math.max(0, 1 - (a - 2.2) * 2) : 1
  })
  const dim = useTransform(position, (v) => Math.min(Math.abs(index - v), 1) * 0.45)
  const zIndex = useTransform(position, (v) => 100 - Math.round(Math.abs(index - v) * 10))

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`Show ${product.name}`}
      tabIndex={-1}
      style={{ transform, opacity, zIndex }}
      className="absolute inset-0 overflow-hidden rounded-[28px] bg-surface-2 ring-1 ring-black/5 will-change-transform dark:ring-white/10"
    >
      {product.image ? (
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 64vw, 400px" className="object-cover" draggable={false} />
      ) : (
        <span className="grid h-full w-full place-items-center text-sm text-muted">{product.name}</span>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.22)_0%,transparent_30%)]" />
      <motion.span aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-background" />
      {product.isOutOfStock && (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[#1d1d1f]">Sold out</span>
      )}
    </motion.button>
  )
}
