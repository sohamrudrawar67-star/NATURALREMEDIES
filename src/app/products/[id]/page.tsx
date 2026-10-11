'use client'

import { getProductById } from '@/lib/products'
import { CartQuantityButton } from '@/components/CartQuantityButton'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { Product } from '@/store/useCartStore'
import { useProducts } from '@/lib/useProducts'
import { ArrowLeft, MessageCircle, Truck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { motion, useMotionTemplate, useSpring, useReducedMotion } from 'motion/react'

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()

  useEffect(() => {
    let alive = true
    getProductById(id).then((p) => {
      if (!alive) return
      setProduct(p)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 pb-24 pt-32 md:grid-cols-2 md:pt-36">
        <div className="skeleton aspect-square rounded-[32px]" />
        <div className="flex flex-col gap-4 md:pt-10">
          <div className="skeleton h-4 w-24 rounded-md" />
          <div className="skeleton h-12 w-3/4 rounded-xl" />
          <div className="skeleton h-6 w-20 rounded-md" />
          <div className="skeleton mt-6 h-24 w-full rounded-2xl" />
          <div className="skeleton mt-6 h-[52px] w-[260px] rounded-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="enter mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 pt-24 text-center">
        <h1 className="text-[32px] font-semibold tracking-[-0.03em]">This one&rsquo;s gone.</h1>
        <p className="mt-3 text-[16px] text-muted">It may have been removed from the shop. Everything else is still here.</p>
        <Link href="/products" className="press btn-primary mt-8 h-11 px-6 text-[15px]">
          Back to the shop
        </Link>
      </div>
    )
  }

  const others = products.filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-28 md:pt-32">
      <Link href="/products" className="enter press inline-flex items-center gap-1.5 rounded-full py-2 pr-3 text-[14px] text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Shop
      </Link>

      <div className="mt-4 grid items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <TiltImage product={product} />

        <div className="enter flex flex-col md:sticky md:top-28 md:pt-6" style={{ animationDelay: '120ms' }}>
          {product.isOutOfStock ? (
            <span className="w-fit rounded-full bg-surface-2 px-3 py-1 text-[12.5px] font-medium text-muted">Sold out for now</span>
          ) : (
            <span className="flex w-fit items-center gap-2 text-[13px] font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> In stock
            </span>
          )}
          <h1 className="mt-4 text-balance text-[clamp(36px,4.6vw,60px)] font-semibold leading-[1] tracking-[-0.045em]">
            {product.name}
          </h1>
          <p className="mt-4 text-[26px] font-medium tabular-nums tracking-[-0.02em]">₹{product.price}</p>

          {product.description && (
            <p className="mt-6 max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-muted">{product.description}</p>
          )}

          <div className="mt-8">
            <CartQuantityButton product={product} large />
          </div>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            <Fact icon={<MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />} title="Ordered over WhatsApp">
              Checkout opens a chat with your order written out.
            </Fact>
            <Fact icon={<Truck className="h-[18px] w-[18px]" strokeWidth={1.6} />} title="Free delivery">
              No delivery charge added at checkout.
            </Fact>
            <Fact icon={<ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.6} />} title="No account needed">
              Just your name, number and address.
            </Fact>
          </ul>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-28">
          <Reveal>
            <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold tracking-[-0.04em]">
              Also on the <em className="font-serif font-normal italic">shelf.</em>
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Tilts toward the pointer on a spring — decorative, so it's allowed to have a little life. */
function TiltImage({ product }: { product: Product }) {
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
        className="relative aspect-square overflow-hidden rounded-[32px] bg-surface-2 ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted">No photo yet</span>
        )}
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,transparent_35%)]" />
      </motion.div>
    </div>
  )
}

function Fact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4 py-4">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-foreground/80">{icon}</span>
      <div>
        <div className="text-[15px] font-medium tracking-[-0.01em]">{title}</div>
        <div className="mt-0.5 text-[14px] text-muted">{children}</div>
      </div>
    </li>
  )
}
