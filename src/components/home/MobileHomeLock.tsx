'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, Check, MessageCircle, MapPin } from 'lucide-react'
import { Product, productHref, calculateDiscount } from '@/store/useCartStore'
import { CartQuantityButton } from '@/components/CartQuantityButton'
import { WHATSAPP_URL, STORE_ADDRESS } from '@/lib/site'
import { HeroGreeting } from '@/components/HeroGreeting'

interface MobileHomeLockProps {
  products: Product[]
  faqs?: { q: string; a: string }[]
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export function MobileHomeLock({ products, faqs = [] }: MobileHomeLockProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [scrollRatio, setScrollRatio] = useState(0)

  // Products
  const withImages = products.filter((p) => p.image)
  const heroProducts = (withImages.length > 0 ? withImages : products).sort((a, b) => a.price - b.price)
  const heroJarImage = products.length > 0 ? [...products].sort((a, b) => b.price - a.price)[0]?.image : undefined

  // Second slide (Beat 2) lateral scroll state
  const [beat2ActiveIndex, setBeat2ActiveIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)

  // Total vertical slides = 6 fixed slides:
  // Slide 0: Hero Intro (Clean text & buttons)
  // Slide 1: 3D Product Standup Beat (With lateral scrolling & Add to basket!)
  // Slide 2: Statement Reveal (Words light up)
  // Slide 3: How To Order
  // Slide 4: FAQ
  // Slide 5: Closing Frame & Footer
  const totalSlides = 6

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ticking = false
    let lastRatio = 0

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false
          if (!container) return
          const h = container.clientHeight || window.innerHeight
          const st = container.scrollTop
          // Only calculate and update scrollRatio while animating between Slide 0 and Slide 1
          if (st <= h * 1.15) {
            const r = Math.min(1, Math.max(0, st / h))
            if (Math.abs(r - lastRatio) > 0.005) {
              lastRatio = r
              setScrollRatio(r)
            }
          } else if (lastRatio !== 1) {
            lastRatio = 1
            setScrollRatio(1)
          }
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

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
    return () => {
      container.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [totalSlides])

  const scrollToSlide = (idx: number) => {
    const container = containerRef.current
    if (!container) return
    const target = container.querySelector<HTMLElement>(`[data-slide-index="${idx}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation interpolation factor between Slide 0 and Slide 1
  const standupProgress = activeSlide >= 1 ? 1 : scrollRatio

  // Beat 2 touch swipe handlers for lateral scrolling
  const handleBeat2TouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }

  const handleBeat2TouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }

  const handleBeat2TouchEnd = () => {
    if (touchDeltaX.current < -30) {
      // Swiped left -> next jar
      setBeat2ActiveIndex((prev) => Math.min(heroProducts.length - 1, prev + 1))
    } else if (touchDeltaX.current > 30) {
      // Swiped right -> prev jar
      setBeat2ActiveIndex((prev) => Math.max(0, prev - 1))
    }
  }


  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 h-[100svh] w-full overflow-y-auto snap-y snap-mandatory overscroll-y-contain bg-background"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Discreet Vertical Slide Indicator (Tap to jump) */}
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
      {/* SLIDE 0: HERO INTRO (CLEAN EDITORIAL WELCOME)             */}
      {/* ======================================================== */}
      <section
        data-slide-index={0}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(5rem,14svh)] pb-8 px-6 text-center"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="absolute inset-0 -z-10 grain pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#e8f2df_0%,var(--background)_65%)] dark:bg-[radial-gradient(90%_70%_at_50%_25%,#14240e_0%,var(--background)_70%)]" />
          <div className="absolute left-1/2 top-[50%] h-[52vh] w-[92vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(90,145,50,0.22),transparent)] dark:bg-[radial-gradient(closest-side,rgba(142,198,81,0.18),transparent)]" />
        </div>

        {/* Center Content */}
        <div className="my-auto flex flex-col items-center text-center z-10 max-w-[340px] mx-auto">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tint text-tint-foreground border border-primary/20 text-[12.5px] font-medium mb-3 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <HeroGreeting fallback="100% Raw & Natural Homegrown" />
          </p>

          <h1 className="text-balance text-[clamp(40px,10.5vw,52px)] font-semibold leading-[0.96] tracking-[-0.045em]">
            Good things,
            <br />
            kept <em className="font-serif font-normal italic text-primary">simple.</em>
          </h1>

          <p className="mt-4 max-w-[28ch] text-[15.5px] leading-[1.45] text-muted">
            Simple, natural everyday goods from a small homegrown brand. Order in a minute.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/products"
              prefetch={true}
              className="press btn-primary h-12 px-7 text-[15px] font-medium active:scale-95 transition-transform"
            >
              Shop now
            </Link>
            <Link
              href="/about"
              prefetch={true}
              className="press btn-secondary h-12 px-7 text-[15px] font-medium active:scale-95 transition-transform border border-line"
            >
              Our story
            </Link>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <button
          onClick={() => scrollToSlide(1)}
          className="press mx-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-2/90 backdrop-blur-sm border border-primary/20 text-[13px] font-medium text-foreground/80 hover:text-foreground shadow-xs z-10 active:scale-95 transition-transform"
        >
          <span>Explore our shelf</span>
          <ChevronDown className="h-4 w-4 text-primary animate-bounce" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE 1: 3D STANDUP BEAT WITH LATERAL SCROLLING          */}
      {/* ======================================================== */}
      <section
        data-slide-index={1}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,11svh)] pb-6 px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="absolute inset-0 -z-10 grain pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_20%,#e8f2df_0%,var(--background)_70%)] dark:bg-[radial-gradient(90%_70%_at_50%_30%,#14240e_0%,var(--background)_70%)]" />
          <div className="absolute left-1/2 top-[55%] h-[42vh] w-[85vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(90,145,50,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(142,198,81,0.15),transparent)]" />
        </div>

        {/* Top Text for Beat 2 */}
        <div
          className="flex flex-col items-center text-center z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            opacity: Math.max(0.15, standupProgress),
            transform: `translateY(${(1 - standupProgress) * 16}px)`,
          }}
        >
          <h2 className="text-[clamp(30px,7.8vw,42px)] font-semibold leading-[1] tracking-[-0.04em]">
            A short list, <em className="font-serif font-normal italic text-primary">on purpose.</em>
          </h2>
          <p className="mt-2 max-w-[32ch] text-[14.5px] leading-[1.4] text-muted">
            We&rsquo;d rather sell a few things we like than a hundred we don&rsquo;t.
          </p>
          <Link href="/products" prefetch={true} className="link-arrow mt-2.5 text-[14px] font-medium active:opacity-75">
            See everything <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3D Stage with Touch Lateral Swipe Listeners */}
        <div
          className="relative flex-1 flex flex-col items-center justify-center my-2 touch-pan-x"
          onTouchStart={handleBeat2TouchStart}
          onTouchMove={handleBeat2TouchMove}
          onTouchEnd={handleBeat2TouchEnd}
          style={{ perspective: 1200 }}
        >
          <div className="relative w-[160px] h-[205px]" style={{ transformStyle: 'preserve-3d' }}>
            {heroProducts.map((p, i) => {
              // Offset relative to the laterally selected card (beat2ActiveIndex)
              const offset = i - beat2ActiveIndex // -1, 0, 1
              const isSelected = offset === 0

              // Upright standup values that adapt to lateral selection
              const currentRx = (1 - standupProgress) * 58
              const currentX = offset * (75 + standupProgress * 15)
              const currentY = isSelected
                ? (1 - standupProgress) * 38 - 8
                : (1 - standupProgress) * 48 + 12
              const currentZ = isSelected
                ? standupProgress * 36
                : (1 - standupProgress) * -20 - standupProgress * 50
              const currentRy = -offset * (standupProgress * 18)
              const currentRz = offset * ((1 - standupProgress) * 10 + standupProgress * 3)
              const currentScale = isSelected
                ? 0.95 + standupProgress * 0.12
                : 0.86 + standupProgress * 0.05
              const currentOpacity = isSelected ? 1 : 0.72

              const discount = calculateDiscount(p.price, p.cutPrice)

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isSelected) {
                      router.push(productHref(p))
                    } else {
                      setBeat2ActiveIndex(i)
                    }
                  }}
                  className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform cursor-pointer"
                  style={{
                    transform: `translate3d(${currentX}px, ${currentY}px, ${currentZ}px) rotateX(${currentRx}deg) rotateY(${currentRy}deg) rotateZ(${currentRz}deg) scale(${currentScale})`,
                    zIndex: isSelected ? 20 : 10,
                    opacity: currentOpacity,
                  }}
                >
                  <div className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-surface-2 shadow-[0_26px_52px_-20px_rgba(0,0,0,0.65)] ring-1 ring-primary/20 dark:ring-primary/30">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="180px"
                        className="object-cover"
                        priority
                      />
                    )}
                    <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgba(255,255,255,0.3)_0%,transparent_35%)]" />

                    {/* Attention Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Product Name & Price Tag */}
                    <div
                      className={`absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5 rounded-xl px-2.5 py-1.5 shadow-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-white/95 text-[#1d1d1f] dark:bg-black/90 dark:text-white ring-1 ring-primary/40'
                          : 'bg-white/70 text-[#1d1d1f]/80 dark:bg-black/60 dark:text-white/80'
                      }`}
                      style={{
                        opacity: standupProgress,
                        transform: `translateY(${(1 - standupProgress) * 12}px)`,
                      }}
                    >
                      <span className="truncate text-[12px] font-semibold">{p.name}</span>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span className="text-[12px] tabular-nums font-semibold text-primary">₹{p.price}</span>
                        {p.cutPrice && p.cutPrice > p.price && (
                          <span className="text-[10px] line-through text-muted tabular-nums">₹{p.cutPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Lateral Navigation Dots & Hint */}
          <div className="mt-3 flex flex-col items-center gap-1 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBeat2ActiveIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous jar"
                className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                disabled={beat2ActiveIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 max-w-[200px] overflow-x-auto no-scrollbar py-0.5">
                {heroProducts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBeat2ActiveIndex(i)}
                    className="p-1"
                    aria-label={`View jar ${i + 1}`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        beat2ActiveIndex === i
                          ? 'w-4 h-1.5 bg-primary'
                          : 'w-1.5 h-1.5 bg-foreground/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setBeat2ActiveIndex((prev) => Math.min(heroProducts.length - 1, prev + 1))}
                aria-label="Next jar"
                className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                disabled={beat2ActiveIndex === heroProducts.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="text-[11px] text-muted tracking-tight">Tap selected jar or Details to open</span>
          </div>

          {/* Active Product Action Bar (Add to basket + stepper) */}
          {heroProducts[beat2ActiveIndex] && (() => {
            const activeProduct = heroProducts[beat2ActiveIndex]
            const activeDiscount = calculateDiscount(activeProduct.price, activeProduct.cutPrice)
            return (
              <div className="mt-2.5 w-full max-w-[340px] px-1 z-10">
                <div className="flex items-center justify-between gap-2.5 rounded-2xl bg-surface/95 dark:bg-surface/95 backdrop-blur-md p-2.5 border border-primary/20 shadow-md ring-1 ring-primary/10">
                  <div className="min-w-0 flex-1 pl-1">
                    <Link href={productHref(activeProduct)} prefetch={true} className="block group">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-[13.5px] font-semibold tracking-tight group-hover:text-primary transition-colors">
                          {activeProduct.name}
                        </h3>
                        {activeProduct.isOutOfStock && (
                          <span className="shrink-0 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger">
                            Sold out
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[13.5px] font-bold text-primary tabular-nums">₹{activeProduct.price}</span>
                      {activeProduct.cutPrice && activeProduct.cutPrice > activeProduct.price && (
                        <span className="text-[11px] line-through text-muted tabular-nums">₹{activeProduct.cutPrice}</span>
                      )}
                      {activeDiscount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {activeDiscount}% OFF
                        </span>
                      )}
                      <span className="text-[10px] text-muted">·</span>
                      <Link
                        href={productHref(activeProduct)}
                        prefetch={true}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
                      >
                        Details <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <CartQuantityButton product={activeProduct} />
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Bottom CTA Button */}
        <button
          onClick={() => scrollToSlide(2)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground z-10"
        >
          <span>Our story</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
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
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_40%,rgba(90,145,50,0.16)_0%,var(--background)_70%)] dark:bg-[radial-gradient(90%_70%_at_50%_35%,rgba(142,198,81,0.14)_0%,var(--background)_70%)]" />
        </div>

        <div className="my-auto flex flex-col items-center text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-tint text-tint-foreground border border-primary/20 text-[12px] font-medium mb-6 shadow-xs">
            🌿 Small, Herbal & Homegrown
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
          <span>How to order</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE 3: HOW TO ORDER                                    */}
      {/* ======================================================== */}
      <section
        data-slide-index={3}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,10svh)] pb-5 px-5"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">Ordering</span>
          <h2 className="text-[clamp(24px,6.8vw,32px)] font-semibold leading-[1.05] tracking-[-0.03em] mt-1">
            No checkout maze.
            <br />
            <span className="text-muted">Just a message.</span>
          </h2>
        </div>

        {/* 3 Step Cards */}
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
          onClick={() => scrollToSlide(4)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>Frequently asked</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE 4: FAQ                                             */}
      {/* ======================================================== */}
      <section
        data-slide-index={4}
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
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 group-open:bg-tint text-[14px] text-muted group-open:text-primary border border-primary/10 group-open:border-primary/25 transition-all duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-1.5 pr-4 text-[13px] leading-[1.5] text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => scrollToSlide(5)}
          className="press mx-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2/80 backdrop-blur-sm border border-line text-[12.5px] font-medium text-muted hover:text-foreground"
        >
          <span>Closing thoughts</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </section>

      {/* ======================================================== */}
      {/* SLIDE 5: CLOSING FRAME & MOBILE FOOTER                    */}
      {/* ======================================================== */}
      <section
        data-slide-index={5}
        className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden flex flex-col justify-between pt-[max(4.5rem,10svh)] pb-5 px-5 bg-[#0d1609] text-[#f0f5ec]"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_35%,rgba(142,198,81,0.22),transparent)] pointer-events-none" />
        <div className="grain absolute inset-0 pointer-events-none" />

        {/* Floating Jar Showcase */}
        {heroJarImage && (
          <div className="relative flex justify-center mt-2" style={{ perspective: 1000 }}>
            <div className="relative aspect-square w-[160px] overflow-hidden rounded-[26px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-primary/40">
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
              prefetch={true}
              className="press inline-flex h-11 items-center rounded-full bg-white px-6 text-[14px] font-medium text-black hover:bg-white/90 active:scale-95 transition-transform"
            >
              Shop the shelf
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex h-11 items-center rounded-full border border-white/25 bg-white/10 px-5 text-[14px] font-medium text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-transform"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>

        {/* Integrated Mobile Footer */}
        <div className="border-t border-white/10 pt-3 z-10 flex flex-col items-center gap-2 text-center">
          <a
            href={STORE_ADDRESS.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11.5px] text-white/85 hover:text-white transition-colors"
          >
            <MapPin className="h-3 w-3 text-primary" />
            <span>Store: Bavdhan, Pune, Maharashtra ↗</span>
          </a>
          <div className="flex items-center gap-3.5 text-[13px] text-white/70 flex-wrap justify-center">
            <Link href="/products" prefetch={true} className="hover:text-white py-1">Shop</Link>
            <span>•</span>
            <Link href="/cart" prefetch={true} className="hover:text-white py-1">Basket</Link>
            <span>•</span>
            <Link href="/orders" prefetch={true} className="hover:text-white py-1 text-primary">Orders</Link>
            <span>•</span>
            <Link href="/about" prefetch={true} className="hover:text-white py-1">Our story</Link>
            <span>•</span>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-white py-1">WhatsApp</a>
          </div>
          <div className="text-[11.5px] text-white/40">
            © {new Date().getFullYear()} Natural Remedies • Pune, India
          </div>
        </div>
      </section>
    </div>
  )
}
