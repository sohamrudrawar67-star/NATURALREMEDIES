import { CartQuantityButton } from '@/components/CartQuantityButton'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { Product } from '@/store/useCartStore'
import { ChevronRight, MessageCircle, Truck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { TiltImage } from './TiltImage'

/** Product page. A server component: only the photo tilt and the basket button hydrate. */
export function ProductDetail({ product, others }: { product: Product; others: Product[] }) {
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
          <li aria-current="page" className="truncate text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

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
