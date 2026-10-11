'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ShoppingBag, ChevronDown, Check, Plus, MessageCircle } from 'lucide-react'
import { Product, productHref } from '@/store/useCartStore'
import { CartQuantityButton } from '@/components/CartQuantityButton'
import { WHATSAPP_URL } from '@/lib/site'
import { HeroGreeting } from '@/components/HeroGreeting'

interface MobileHomeLockProps {
  products: Product[]
  faqs?: { q: string; a: string }[]
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export function MobileHomeLock({ products, faqs = [] }: MobileHomeLockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const withImages = products.filter((p) => p.image)
  const heroProducts = withImages.slice(0, 3).sort((a, b) => a.price - b.price)
  const shelfProducts = products.length > 0 ? products : heroProducts
  const heroJarImage = products.length > 0 ? [...products].sort((a, b) => b.price - a.price)[0]?.image : undefined

  // Total slides:
  // Slide 0: Hero Intro
  // Slide 1: Hero Standup (3D cards rise up)
  // Slide 2: Statement Reveal
  // Slide 3 .. 3 + shelfProducts.length - 1: Shelf products (1 slide per product)
  // Slide N: How To Order
  // Slide N+1: FAQ
  // Slide N+2: Closing Frame & Footer
  const shelfStartIndex = 3
  const howToOrderIndex = shelfStartIndex + shelfProducts.length
  const faqIndex = howToOrderIndex + 1
  const closingIndex = faqIndex + 1
  const totalSlides = closingIndex + 1

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const slideElements = container.querySelectorAll<HTMLElement>('[data-slide-index]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-slide-index'))
            if (!isNaN(idx)) {
              setActiveSlide(idx)
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.52,
      }
    )

    slideElements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [totalSlides])

  const scrollToSlide = (idx: number) => {
    const container = containerRef.current
    if (!container) return
    const target = container.querySelector<HTMLElement>(`[data-slide-index="${idx}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 h-[100svh] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-contain bg-background select-none"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Discreet Slide Indicator (Tap to jump) */}
      <div className="fixed right-2.5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 p-1 rounded-full bg-surface/60 backdrop-blur-md border border-line/50 pointer-events-auto">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            aria-label={`Go to section ${i + 1}`}
            className="group p-0.5"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeSlide === i
                  ? 'h-3.5 w-1.5 bg-primary'
                  : 'h-1.5 w-1.5 bg-foreground/25 hover:bg-foreground/50'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* SLIDE 0: HERO INTRO (CARDS LYING FLAT ON TABLE)           */}
      {/* ======================================================== */}
      <section
        data-slide-index={0}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,11svh)] pb-5 px-5"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 grain pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#f4f1ea_0%,var(--background)_60%)] dark:bg-[radial-gradient(90%_70%_at_50%_30%,#151a11_0%,#000_65%)]" />
          <div className="absolute left-1/2 top-[60%] h-[40vh] w-[90vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(120,150,80,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(163,207,114,0.12),transparent)]" />
        </div>

        {/* Top Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="flex flex-col items-center text-center z-10"
        >
          <p className="inline-flex items-center gap-2 text-[12.5px] font-medium text-muted mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <HeroGreeting fallback="A small homegrown shop" />
          </p>
          <h1 className="text-[clamp(34px,9vw,44px)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Good things,
            <br />
            kept <em className="font-serif font-normal italic text-primary">simple.</em>
          </h1>
          <p className="mt-2.5 max-w-[28ch] text-[14.5px] leading-[1.4] text-muted">
            Simple, natural everyday goods from a small homegrown brand. Order in a minute.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link href="/products" className="press btn-primary h-10 px-5 text-[14px]">
              Shop now
            </Link>
            <Link href="/about" className="press btn-secondary h-10 px-5 text-[14px]">
              Our story
            </Link>
          </div>
        </motion.div>

        {/* 3D Stage: 3 Cards Lying Flat on Table */}
        <div className="relative flex-1 flex items-center justify-center my-1" style={{ perspective: 1100 }}>
          <div className="relative w-[140px] h-[175px]" style={{ transformStyle: 'preserve-3d' }}>
            {heroProducts.map((p, i) => {
              const k = i - 1 // -1, 0, 1
              const scatters = [
                { rx: 56, rz: -9, x: -55, y: 14 },
                { rx: 56, rz: 1, x: 0, y: -4 },
                { rx: 56, rz: 10, x: 55, y: 16 },
              ][i % 3]

              return (
                <div
                  key={p.id}
                  className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
                  style={{
                    transform: `translate3d(${scatters.x}px, ${scatters.y}px, 0px) rotateX(${scatters.rx}deg) rotateZ(${scatters.rz}deg)`,
                    zIndex: k === 0 ? 2 : 1,
                  }}
                >
                  <Link
                    href={productHref(p)}
                    className="group relative block h-full w-full overflow-hidden rounded-[20px] bg-surface-2 shadow-[0_20px_35px_-15px_rgba(0,0,0,0.5)] ring-1 ring-black/5 dark:ring-white/10"
                  >
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                        priority
                      />
                    )}
                    <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgba(255,255,255,0.25)_0%,transparent_35%)]" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA / Swipe prompt */}
        <button
          onClick={() => scrollToSlide(1)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>Explore our shelf</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE 1: HERO STANDUP BEAT (3D CARDS STAND UP & FAN OUT) */}
      {/* ======================================================== */}
      <section
        data-slide-index={1}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,11svh)] pb-5 px-5"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="absolute inset-0 -z-10 grain pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_20%,#f4f1ea_0%,var(--background)_70%)] dark:bg-[radial-gradient(90%_70%_at_50%_30%,#151a11_0%,#000_65%)]" />
        </div>

        {/* Top Text for Beat 2 */}
        <motion.div
          animate={activeSlide === 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 15, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="flex flex-col items-center text-center z-10"
        >
          <h2 className="text-[clamp(30px,7.8vw,40px)] font-semibold leading-[1] tracking-[-0.04em]">
            A short list, <em className="font-serif font-normal italic text-primary">on purpose.</em>
          </h2>
          <p className="mt-2 max-w-[32ch] text-[14px] leading-[1.4] text-muted">
            We&rsquo;d rather sell a few things we like than a hundred we don&rsquo;t.
          </p>
          <Link href="/products" className="link-arrow mt-2.5 text-[14px] font-medium">
            See everything <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* 3D Stage: The 3 Cards STAND UP in 3D */}
        <div className="relative flex-1 flex items-center justify-center my-1" style={{ perspective: 1200 }}>
          <div className="relative w-[148px] h-[190px]" style={{ transformStyle: 'preserve-3d' }}>
            {heroProducts.map((p, i) => {
              const k = i - 1 // -1, 0, 1
              const isCenter = k === 0

              // Upright 3D fanned standup values
              const standX = k * 74
              const standY = isCenter ? -10 : 8
              const standZ = isCenter ? 26 : -45
              const standRy = -k * 18
              const standRz = k * 3

              return (
                <div
                  key={p.id}
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
                  style={{
                    transform: activeSlide === 1
                      ? `translate3d(${standX}px, ${standY}px, ${standZ}px) rotateX(0deg) rotateY(${standRy}deg) rotateZ(${standRz}deg)`
                      : `translate3d(${k * 50}px, 40px, 0px) rotateX(56deg) rotateY(0deg) rotateZ(0deg)`,
                    zIndex: isCenter ? 20 : 10,
                  }}
                >
                  <Link
                    href={productHref(p)}
                    className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-surface-2 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.65)] ring-1 ring-black/10 dark:ring-white/15"
                  >
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                        priority
                      />
                    )}
                    <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgba(255,255,255,0.3)_0%,transparent_35%)]" />

                    {/* Product Name & Price Tag */}
                    <div
                      className={`absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5 rounded-xl bg-white/95 px-2.5 py-1.5 text-[#1d1d1f] shadow-sm dark:bg-black/80 dark:text-white transition-opacity duration-500 ${
                        activeSlide === 1 ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="truncate text-[11.5px] font-semibold">{p.name}</span>
                      <span className="shrink-0 text-[11.5px] tabular-nums font-medium text-primary">₹{p.price}</span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => scrollToSlide(2)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>Our story</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE 2: STATEMENT REVEAL (WORDS LIGHT UP ON ENTRY)      */}
      {/* ======================================================== */}
      <section
        data-slide-index={2}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,13svh)] pb-6 px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="absolute inset-0 -z-10 grain pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_40%,rgba(163,207,114,0.08)_0%,var(--background)_70%)]" />
        </div>

        <div className="my-auto flex flex-col items-center text-center">
          <span className="px-3 py-1 rounded-full bg-tint text-tint-foreground text-[12px] font-medium mb-6">
            Small & Homegrown
          </span>

          <p className="text-balance text-[clamp(25px,6.8vw,36px)] font-semibold leading-[1.2] tracking-[-0.03em] max-w-[20ch]">
            {[
              'Natural', 'Remedies', 'is', 'a', 'small,', 'homegrown', 'brand.',
              'We', 'keep', 'the', 'shelf', 'short', 'and', 'ordering', 'simple',
              '—', 'pick', 'what', 'you', 'need,', 'send', 'us', 'a', 'message,',
              'and', 'get', 'on', 'with', 'your', 'day.'
            ].map((w, idx) => {
              const clean = w.replace(/[.,—]/g, '')
              const isEmphasized = clean === 'homegrown' || clean === 'short'
              return (
                <span
                  key={idx}
                  className={`inline-block mr-[0.25em] transition-all duration-500 ${
                    activeSlide === 2 ? 'opacity-100 translate-y-0 filter-none' : 'opacity-25 translate-y-1 blur-[1px]'
                  } ${isEmphasized ? 'font-serif font-normal italic text-primary' : ''}`}
                  style={{ transitionDelay: `${activeSlide === 2 ? idx * 24 : 0}ms` }}
                >
                  {w}
                </span>
              )
            })}
          </p>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => scrollToSlide(3)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>View the shelf</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDES 3..N: THE SHELF (1 PRODUCT PER SCREEN LOCK)       */}
      {/* ======================================================== */}
      {shelfProducts.map((product, pIdx) => {
        const slideIndex = shelfStartIndex + pIdx
        const isCurrentActive = activeSlide === slideIndex

        return (
          <section
            key={product.id}
            data-slide-index={slideIndex}
            className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,11svh)] pb-5 px-5"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            {/* Shelf Header & Indicator Tabs */}
            <div className="flex items-center justify-between gap-4 z-10">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">The Shelf</span>
                <h2 className="text-[24px] font-semibold tracking-[-0.03em] leading-tight">
                  {pIdx + 1} <span className="text-muted text-[16px] font-normal">/ {shelfProducts.length}</span>
                </h2>
              </div>

              {/* Shelf Tab Dots */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-2/80 border border-line">
                {shelfProducts.map((p, dotIdx) => (
                  <button
                    key={p.id}
                    onClick={() => scrollToSlide(shelfStartIndex + dotIdx)}
                    className="p-1"
                    aria-label={`Jump to ${p.name}`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        dotIdx === pIdx
                          ? 'w-5 h-2 bg-primary'
                          : 'w-2 h-2 bg-foreground/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Shelf Stage: Centered Active Product Card with Neighbors in 3D Depth */}
            <div className="relative flex-1 flex items-center justify-center my-1" style={{ perspective: 1200 }}>
              <div className="relative w-[190px] h-[235px]" style={{ transformStyle: 'preserve-3d' }}>
                {shelfProducts.map((item, itemIdx) => {
                  const offset = itemIdx - pIdx // -1, 0, 1
                  const isCenter = offset === 0

                  // 3D Shelf angles
                  let x = 0
                  let z = 0
                  let ry = 0
                  let scale = 1
                  let opacity = 1

                  if (isCenter) {
                    x = 0
                    z = 30
                    ry = 0
                    scale = 1
                    opacity = 1
                  } else if (offset === -1) {
                    x = -115
                    z = -80
                    ry = 36
                    scale = 0.82
                    opacity = 0.55
                  } else if (offset === 1) {
                    x = 115
                    z = -80
                    ry = -36
                    scale = 0.82
                    opacity = 0.55
                  } else {
                    opacity = 0
                    scale = 0.5
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isCenter && scrollToSlide(shelfStartIndex + itemIdx)}
                      className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform cursor-pointer"
                      style={{
                        transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${ry}deg) scale(${scale})`,
                        opacity,
                        zIndex: isCenter ? 30 : 10,
                        pointerEvents: opacity === 0 ? 'none' : 'auto',
                      }}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-surface-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/10 dark:ring-white/15">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="220px"
                            className="object-cover"
                            priority={isCenter}
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-sm text-muted">{item.name}</div>
                        )}
                        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.25)_0%,transparent_35%)]" />

                        {item.isOutOfStock && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-[#1d1d1f]">
                            Sold out
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Product Details & Actions */}
            <div className="flex flex-col items-center text-center z-10 px-2">
              <h3 className="text-[22px] font-semibold tracking-[-0.03em]">{product.name}</h3>
              {product.description && (
                <p className="mt-1 line-clamp-2 max-w-[34ch] text-[13.5px] leading-[1.4] text-muted">
                  {product.description}
                </p>
              )}

              <div className="mt-3.5 flex items-center gap-3">
                <span className="text-[17px] font-semibold tabular-nums text-foreground">
                  ₹{product.price}
                </span>
                <CartQuantityButton product={product} />
                <Link
                  href={productHref(product)}
                  className="press inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-foreground"
                >
                  Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Bottom Nav Hint */}
              <button
                onClick={() => scrollToSlide(slideIndex + 1)}
                className="press mt-3 flex items-center gap-1 text-[12px] text-muted hover:text-foreground"
              >
                <span>{pIdx === shelfProducts.length - 1 ? 'How to order' : 'Next jar'}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        )
      })}

      {/* ======================================================== */}
      {/* SLIDE: HOW TO ORDER                                      */}
      {/* ======================================================== */}
      <section
        data-slide-index={howToOrderIndex}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,10svh)] pb-5 px-5"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        {/* Header */}
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">Ordering</span>
          <h2 className="text-[clamp(24px,6.8vw,32px)] font-semibold leading-[1.05] tracking-[-0.03em] mt-1">
            No checkout maze.
            <br />
            <span className="text-muted">Just a message.</span>
          </h2>
        </div>

        {/* 3 Step Cards formatted compactly for screen-lock */}
        <div className="space-y-2.5 my-auto">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-[20px] bg-surface border border-line">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
              1
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold">Fill your basket</h3>
              <p className="text-[12.5px] text-muted leading-tight mt-0.5">
                Add what you need. Your basket stays saved on this device.
              </p>
            </div>
            <ShoppingBag className="h-4 w-4 text-primary shrink-0 mt-1" strokeWidth={1.75} />
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-[20px] bg-surface border border-line">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
              2
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold">Tell us where</h3>
              <p className="text-[12.5px] text-muted leading-tight mt-0.5">
                Your name, phone & delivery address. No passwords or accounts.
              </p>
            </div>
            <Check className="h-4 w-4 text-primary shrink-0 mt-1" strokeWidth={1.75} />
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-[20px] bg-[#e7efe0] dark:bg-[#0f160b] border border-primary/20">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
              3
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold">Send on WhatsApp</h3>
              <p className="text-[12.5px] text-muted leading-tight mt-0.5">
                Hit send, and we confirm delivery details directly with you!
              </p>
            </div>
            <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-1" strokeWidth={1.75} />
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => scrollToSlide(faqIndex)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>Frequently asked</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE: FAQ                                               */}
      {/* ======================================================== */}
      <section
        data-slide-index={faqIndex}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,10svh)] pb-5 px-5"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">Questions</span>
          <h2 className="text-[clamp(24px,6.8vw,32px)] font-semibold leading-[1.05] tracking-[-0.03em] mt-1">
            Good to <em className="font-serif font-normal italic text-primary">know.</em>
          </h2>
        </div>

        {/* Accordion Questions */}
        <div className="my-auto divide-y divide-line border-y border-line max-h-[55svh] overflow-y-auto">
          {(faqs.length > 0 ? faqs : [
            {
              q: 'What is Natural Remedies?',
              a: 'Natural Remedies is a homegrown brand providing pure raw honey harvested sustainably.'
            },
            {
              q: 'How do I place an order?',
              a: 'Add your honey to basket, tap checkout, and send your auto-generated message on WhatsApp.'
            },
            {
              q: 'Is delivery free?',
              a: 'Yes, no extra delivery fee is added at checkout.'
            }
          ]).slice(0, 4).map((f, i) => (
            <details key={f.q} className="group py-2.5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-medium tracking-tight">
                <span>{f.q}</span>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[14px] text-muted transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-1.5 pr-4 text-[13px] leading-[1.5] text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => scrollToSlide(closingIndex)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>Closing thoughts</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE: CLOSING FRAME & MOBILE FOOTER                      */}
      {/* ======================================================== */}
      <section
        data-slide-index={closingIndex}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,10svh)] pb-5 px-5 bg-[#15190f] text-white"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        {/* Ambient Dark Room Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_35%,rgba(163,207,114,0.15),transparent)] pointer-events-none" />
        <div className="grain absolute inset-0 pointer-events-none" />

        {/* Floating Jar Showcase */}
        {heroJarImage && (
          <div className="relative flex justify-center mt-2" style={{ perspective: 1000 }}>
            <div className="relative aspect-square w-[160px] overflow-hidden rounded-[26px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20">
              <Image src={heroJarImage} alt="" fill sizes="160px" className="object-cover" />
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.3)_0%,transparent_35%)]" />
            </div>
          </div>
        )}

        {/* Closing Title & Primary CTAs */}
        <div className="flex flex-col items-center text-center z-10">
          <h2 className="text-[clamp(28px,7.5vw,38px)] font-semibold leading-[1] tracking-[-0.04em]">
            Take care of the
            <br />
            <em className="font-serif font-normal italic text-primary">small things.</em>
          </h2>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/products"
              className="press inline-flex h-11 items-center rounded-full bg-white px-6 text-[14px] font-medium text-black hover:bg-white/90"
            >
              Shop the shelf
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex h-11 items-center rounded-full border border-white/25 bg-white/10 px-5 text-[14px] font-medium text-white backdrop-blur-md hover:bg-white/20"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>

        {/* Integrated Mobile Footer */}
        <div className="border-t border-white/10 pt-3 z-10 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-4 text-[13px] text-white/70">
            <Link href="/products" className="hover:text-white">Shop</Link>
            <span>•</span>
            <Link href="/cart" className="hover:text-white">Basket</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white">Our story</Link>
            <span>•</span>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
          </div>
          <div className="text-[11.5px] text-white/40">
            © {new Date().getFullYear()} Natural Remedies • Homegrown
          </div>
        </div>
      </section>
    </div>
  )
}
