'use client'

import Link from 'next/link'
import Image from 'next/image'
import { WHATSAPP_URL } from '@/lib/site'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

import { useViewport } from '@/lib/useViewport'

/** A framed photo that opens up to full-bleed as you arrive, then hands you the button. */
export function ClosingFrame({ image }: { image?: string }) {
  const { w, ready } = useViewport()

  if (ready && w < 768) {
    return <MobileClosingFrame image={image} />
  }

  return <DesktopClosingFrame image={image} />
}

function MobileClosingFrame({ image }: { image?: string }) {
  return (
    <section className="px-4 py-10" aria-label="Closing">
      <div className="relative overflow-hidden rounded-[30px] bg-[#15190f] px-6 py-12 text-center text-white shadow-xl">
        <div className="absolute inset-0 -z-10 grain" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(120,150,80,0.2),transparent)]" />

        {image && (
          <div className="relative mx-auto mb-6 aspect-square w-[min(190px,48vw)] overflow-hidden rounded-[22px] shadow-2xl ring-1 ring-white/15">
            <Image src={image} alt="" fill sizes="190px" className="object-cover" />
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.25)_0%,transparent_35%)]" />
          </div>
        )}

        <h2 className="text-balance text-[clamp(30px,7.8vw,44px)] font-semibold leading-[1] tracking-[-0.04em]">
          Take care of the
          <br />
          <em className="font-serif font-normal italic tracking-[-0.02em] text-[#a3cf72]">small things.</em>
        </h2>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/products" className="press inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-full bg-white px-7 text-[15px] font-medium text-black hover:bg-white/90">
            Shop the shelf
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-[15px] font-medium text-white backdrop-blur-md hover:bg-white/20"
          >
            Ask us anything
          </a>
        </div>
      </div>
    </section>
  )
}

function DesktopClosingFrame({ image }: { image?: string }) {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })

  const clipPath = useTransform(scrollYProgress, (v) => {
    const t = reduceMotion ? 1 : Math.min(1, Math.max(0, (v - 0.1) / 0.6))
    const e = 1 - Math.pow(1 - t, 3)
    const side = 14 * (1 - e)
    const top = 10 * (1 - e)
    return `inset(${top}% ${side}% ${top}% ${side}% round ${40 - e * 12}px)`
  })
  const imgTransform = useTransform(scrollYProgress, (v) => `scale(${(reduceMotion ? 1.2 : 1.35 - Math.min(v, 1) * 0.15) * 11})`)
  // The product rises out of the glow and settles, tilted back slightly like it's on a shelf
  const productTransform = useTransform(scrollYProgress, (v) => {
    const t = reduceMotion ? 1 : Math.min(1, Math.max(0, (v - 0.2) / 0.55))
    const e = 1 - Math.pow(1 - t, 3)
    return `translateY(${(1 - e) * 120}px) rotateX(${(1 - e) * 28}deg) scale(${0.86 + e * 0.14})`
  })
  const productOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1])
  const textOpacity = useTransform(scrollYProgress, [0.6, 0.85], [0, 1])
  const textTransform = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.6) / 0.25))
    return `translateY(${(1 - t) * 20}px)`
  })

  return (
    <section ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 h-[100lvh] overflow-hidden">
        <motion.div style={{ clipPath }} className="absolute inset-0 will-change-[clip-path]">
          <div className="absolute inset-0 bg-[#15190f]" />
          {image && (
            // Blur a tiny copy and scale it up: same glow, a fraction of the GPU cost of blurring full-screen
            <div className="absolute left-1/2 top-1/2 h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2">
              <motion.img
                src={image}
                alt=""
                style={{ transform: imgTransform }}
                className="h-full w-full object-cover opacity-70 blur-[3px] saturate-150"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,transparent,rgba(0,0,0,0.55))]" />
          <div className="grain absolute inset-0" />
        </motion.div>

        {image && (
          <div className="absolute inset-x-0 top-[13vh] flex justify-center" style={{ perspective: 1200 }}>
            <motion.div
              style={{ transform: productTransform, opacity: productOpacity }}
              className="relative aspect-square w-[min(38vh,72vw)] overflow-hidden rounded-[30px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15"
            >
              <Image src={image} alt="" fill sizes="(max-width: 768px) 72vw, 38vh" className="object-cover" />
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.25)_0%,transparent_35%)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          style={{ opacity: textOpacity, transform: textTransform }}
          className="absolute inset-x-0 bottom-[calc(100lvh-100svh+7vh)] flex flex-col items-center px-6 text-center text-white"
        >
          <h2 className="text-balance text-[clamp(36px,5.6vw,80px)] font-semibold leading-[0.98] tracking-[-0.045em]">
            Take care of the
            <br />
            <em className="font-serif font-normal italic tracking-[-0.02em]">small things.</em>
          </h2>
          <div className="mt-8 flex items-center gap-3">
            <Link href="/products" className="press inline-flex h-12 items-center rounded-full bg-white px-7 text-[15px] font-medium text-black hover:bg-white/90">
              Shop the shelf
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex h-12 items-center rounded-full border border-white/30 bg-white/10 px-6 text-[15px] font-medium text-white backdrop-blur-md hover:bg-white/20"
            >
              Ask us anything
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
