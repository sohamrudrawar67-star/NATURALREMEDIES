'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, MotionValue } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/store/useCartStore'
import { HeroGreeting } from '@/components/HeroGreeting'
import { useCoarsePointer, useViewport } from '@/lib/useViewport'

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// Strong ease-in-out for on-screen movement (same curve as --ease-in-out)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * The products start lying on a table, slightly scattered, like they were just unpacked.
 * As you scroll they stand up, spread out and face you. Pinned for ~2 viewports.
 */
export function HeroScroll({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // A touch of smoothing so wheel steps don't feel stair-stepped. Not enough to feel floaty.
  const smooth = useSpring(scrollYProgress, { stiffness: 260, damping: 40, mass: 0.4, restDelta: 0.0005 })
  const coarse = useCoarsePointer()
  const progress = reduceMotion || coarse ? scrollYProgress : smooth

  const { w, h: vh, ready } = useViewport()
  const mobile = w < 768
  // Upright cards must fit between the caption (~34vh) and the bottom edge
  const byWidth = mobile ? Math.min(w * 0.5, 240) : Math.min(Math.max(w * 0.22, 200), 340)
  const cardW = Math.min(byWidth, (vh * 0.46) / 1.25)

  const withImages = products.filter((p) => p.image)
  // Smallest to largest reads naturally left to right (100g → 500g → 1kg)
  const ordered = withImages.slice(0, 3).sort((a, b) => a.price - b.price)

  const headlineOpacity = useTransform(progress, [0.04, 0.3], [1, 0])
  const headlineTransform = useTransform(progress, (v) => {
    const t = range(v, 0.02, 0.34)
    return `translateY(${lerp(0, -60, t)}px) scale(${lerp(1, 0.94, t)})`
  })
  const headlineFilter = useTransform(progress, (v) => `blur(${lerp(0, 10, range(v, 0.06, 0.32))}px)`)

  const captionOpacity = useTransform(progress, [0.56, 0.72], [0, 1])
  const captionTransform = useTransform(progress, (v) => `translateY(${lerp(24, 0, easeOut(range(v, 0.56, 0.75)))}px)`)

  const floorOpacity = useTransform(progress, [0, 0.45], [1, 0])
  const hintOpacity = useTransform(progress, [0, 0.06], [1, 0])

  return (
    <section ref={ref} className="relative h-[300vh]" aria-label="Introduction">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Light: warm paper. Dark: a single soft lamp. */}
        <div className="absolute inset-0 -z-10 grain [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#f4f1ea_0%,var(--background)_60%)] dark:bg-[radial-gradient(90%_70%_at_50%_30%,#151a11_0%,#000_65%)]" />
          <div className="absolute left-1/2 top-[62%] h-[46vh] w-[90vw] max-w-[1100px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(120,150,80,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(163,207,114,0.12),transparent)]" />
        </div>

        {/* Headline */}
        <motion.div
          style={{ opacity: headlineOpacity, transform: headlineTransform, filter: mobile ? undefined : headlineFilter }}
          className="pointer-events-none absolute inset-x-0 top-[13vh] z-20 flex flex-col items-center px-6 text-center sm:top-[14vh]"
        >
          <p className="enter mb-5 inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.005em] text-muted" style={{ animationDelay: '80ms' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <HeroGreeting fallback="A small homegrown shop" />
          </p>
          <h1 className="text-balance text-[clamp(44px,8.4vw,112px)] font-semibold leading-[0.95] tracking-[-0.045em]">
            <span className="enter inline-block" style={{ animationDelay: '140ms' }}>Good things,</span>
            <br />
            <span className="enter inline-block" style={{ animationDelay: '220ms' }}>
              kept <em className="font-serif font-normal italic tracking-[-0.02em] text-primary">simple.</em>
            </span>
          </h1>
          <p className="enter mt-6 max-w-[30ch] text-pretty text-[clamp(16px,1.6vw,20px)] leading-[1.45] text-muted" style={{ animationDelay: '300ms' }}>
            Simple, natural everyday goods from a small homegrown brand. Order in a minute, over WhatsApp.
          </p>
          <div className="enter pointer-events-auto mt-8 flex items-center gap-3" style={{ animationDelay: '380ms' }}>
            <Link href="/products" className="press btn-primary h-11 px-6 text-[15px]">
              Shop now
            </Link>
            <Link href="/about" className="press btn-secondary h-11 px-6 text-[15px]">
              Our story
            </Link>
          </div>
        </motion.div>

        {/* 3D stage */}
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ perspective: mobile ? 1300 : 1400 }}>
          <motion.div
            style={{ opacity: floorOpacity }}
            className="absolute left-1/2 top-[74vh] h-24 w-[min(80vw,900px)] -translate-x-1/2 rounded-[50%] bg-black/10 blur-3xl dark:bg-black/60"
          />
          <div className="relative" style={{ width: cardW, height: cardW * 1.25, transformStyle: 'preserve-3d' }}>
            {ready && ordered.map((p, i) => (
              <HeroCard
                key={p.id}
                product={p}
                index={i}
                count={ordered.length}
                progress={progress}
                cardW={cardW}
                vh={vh}
                mobile={mobile}
                reduceMotion={!!reduceMotion}
              />
            ))}
          </div>
        </div>

        {/* Second beat */}
        <motion.div
          style={{ opacity: captionOpacity, transform: captionTransform }}
          className="absolute inset-x-0 top-[11vh] z-20 flex flex-col items-center px-6 text-center sm:top-[13vh]"
        >
          <h2 className="text-balance text-[clamp(32px,5vw,64px)] font-semibold leading-[1] tracking-[-0.04em]">
            A short list, <em className="font-serif font-normal italic tracking-[-0.01em]">on purpose.</em>
          </h2>
          <p className="mt-4 max-w-[38ch] text-pretty text-[clamp(15px,1.4vw,18px)] leading-[1.5] text-muted">
            We&rsquo;d rather sell a few things we like than a hundred we don&rsquo;t.
          </p>
          <Link href="/products" className="link-arrow mt-4 text-[15px]">
            See everything <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-subtle sm:flex">
          Scroll
          <span className="relative h-8 w-px overflow-hidden bg-line-strong">
            <span className="absolute inset-x-0 top-0 h-3 animate-[scrollhint_1.8s_var(--ease-in-out)_infinite] bg-foreground/60" />
          </span>
        </motion.div>
      </div>
      <style>{`@keyframes scrollhint{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}@media (prefers-reduced-motion: reduce){[class*="scrollhint"]{animation:none!important}}`}</style>
    </section>
  )
}

function HeroCard({
  product,
  index,
  count,
  progress,
  cardW,
  vh,
  mobile,
  reduceMotion,
}: {
  product: Product
  index: number
  count: number
  progress: MotionValue<number>
  cardW: number
  vh: number
  mobile: boolean
  reduceMotion: boolean
}) {
  const k = index - (count - 1) / 2 // -1, 0, 1
  const spread = mobile ? 0.62 : 1.12
  // A hand-placed look on the table: each card a little off, none perfectly square
  const scatter = [
    { rz: -9, x: -0.05, y: 10 },
    { rz: 2, x: 0, y: -6 },
    { rz: 11, x: 0.06, y: 14 },
  ][index % 3]

  const transform = useTransform(progress, (v) => {
    const r = reduceMotion ? 1 : easeInOut(range(v, 0.06, 0.58))
    const drift = range(v, 0.6, 1) // after standing up, sides drift back a little
    const x = k * cardW * lerp(0.42 + scatter.x, spread, r)
    // Lying low on the table under the buttons → standing just below the caption
    const h = cardW * 1.25
    const yStart = vh * (mobile ? 0.27 : 0.37) + scatter.y
    const yEnd = h / 2 - vh * 0.1
    const y = lerp(yStart, yEnd, r) - drift * (k === 0 ? 0 : 18)
    // Less depth on phones: a small screen magnifies the perspective
    const z = k === 0 ? lerp(0, mobile ? 24 : 70, r) : lerp(-30, (mobile ? -70 : -110) - drift * 60, r)
    const rx = lerp(mobile ? 58 : 64, 0, r)
    const ry = -k * lerp(0, mobile ? 24 : 20, r)
    const rz = lerp(scatter.rz, 0, r)
    return `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`
  })
  const labelOpacity = useTransform(progress, [0.5, 0.66], [0, 1])

  return (
    // Note: no opacity/filter on these two wrappers. Either one flattens 3D in Safari.
    <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', zIndex: k === 0 ? 2 : 1 }}>
      <motion.div style={{ transform }} className="absolute inset-0 will-change-transform">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25 + index * 0.08, ease: [0.23, 1, 0.32, 1] }}
          className="h-full w-full"
        >
          <Link
            href={`/products/${product.id}`}
            className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-surface-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] ring-1 ring-black/5 dark:ring-white/10 sm:rounded-[28px]"
            tabIndex={-1}
          >
            {product.image && (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" draggable={false} />
            )}
            {/* Specular edge — the glass-case catch light */}
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgba(255,255,255,0.28)_0%,transparent_32%,transparent_70%,rgba(0,0,0,0.18)_100%)]" />
            {/* Solid, not backdrop-blurred: backdrop-filter inside 3D transforms flickers on iOS */}
            <motion.span
              style={{ opacity: labelOpacity }}
              className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 rounded-2xl bg-white/90 px-3.5 py-2.5 text-[#1d1d1f] shadow-sm dark:bg-black/65 dark:text-white sm:inset-x-3 sm:bottom-3"
            >
              <span className="truncate text-[12.5px] font-medium tracking-[-0.01em] sm:text-[14px]">{product.name}</span>
              <span className="shrink-0 text-[12.5px] tabular-nums opacity-60 sm:text-[14px]">₹{product.price}</span>
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
