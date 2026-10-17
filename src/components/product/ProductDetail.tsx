import { CartQuantityButton } from '@/components/CartQuantityButton'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { Product, calculateDiscount } from '@/store/useCartStore'
import { ChevronRight, MessageCircle, Truck, ShieldCheck, Tag } from 'lucide-react'
import Link from 'next/link'
import { TiltImage } from './TiltImage'

/** Product page. A server component: only the photo tilt/gallery and the basket button hydrate. */
export function ProductDetail({ product, others }: { product: Product; others: Product[] }) {
  const discount = calculateDiscount(product.price, product.cutPrice)

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-28 md:pt-32">
      <nav aria-label="Breadcrumb" className="enter">
        <ol className="flex items-center gap-1 text-[14px] text-muted">
          <li>
            <Link href="/" className="rounded-full py-2 hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5 text-subtle" />
          </li>
          <li>
            <Link href="/products" className="rounded-full py-2 hover:text-foreground">
              Shop
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5 text-subtle" />
          </li>
          <li aria-current="page" className="truncate text-foreground font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-4 grid items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <TiltImage product={product} />

        <div className="enter flex flex-col md:sticky md:top-28 md:pt-4" style={{ animationDelay: '120ms' }}>
          {/* Category & Stock Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-tint px-3 py-1 text-[12px] font-semibold text-primary border border-primary/20 shadow-2xs">
              <Tag className="h-3 w-3" />
              {product.category || 'Miscellaneous Products'}
            </span>
            {product.isOutOfStock ? (
              <span className="rounded-full bg-surface-2 px-3 py-1 text-[12px] font-medium text-muted">
                Sold out for now
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> In stock · 100% Homegrown
              </span>
            )}
          </div>

          <h1 className="mt-3.5 text-balance text-[clamp(34px,4.5vw,56px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            {product.name}
          </h1>

          {/* Pricing & Cut Price & Discount Badge (Reference Image Match) */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-[32px] sm:text-[38px] font-bold tabular-nums tracking-[-0.03em] text-primary">
              ₹{product.price}
            </span>
            {product.cutPrice && product.cutPrice > product.price && (
              <span className="text-[20px] sm:text-[22px] line-through tabular-nums text-muted font-normal">
                ₹{product.cutPrice}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-[13px] font-bold text-white shadow-xs tracking-tight">
                {discount}% OFF
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-5 max-w-[46ch] text-pretty text-[16.5px] leading-[1.65] text-muted whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <CartQuantityButton product={product} large />
          </div>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            <Fact icon={<MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />} title="Ordered over WhatsApp">
              Checkout prepares a direct message with order items and your address.
            </Fact>
            <Fact icon={<Truck className="h-[18px] w-[18px]" strokeWidth={1.6} />} title="Courier Delivery Information">
              Free delivery on orders up to ₹500. Orders above ₹500 include a nominal ₹70 courier charge.
            </Fact>
            <Fact icon={<ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.6} />} title="No account needed">
              Just your name, number and delivery address saved locally on your phone.
            </Fact>
          </ul>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-28">
          <Reveal>
            <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold tracking-[-0.04em]">
              Also on the <em className="font-serif font-normal italic text-primary">shelf.</em>
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

function Fact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4 py-4">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint text-primary border border-primary/20">{icon}</span>
      <div>
        <div className="text-[15px] font-medium tracking-[-0.01em]">{title}</div>
        <div className="mt-0.5 text-[14px] text-muted">{children}</div>
      </div>
    </li>
  )
}
