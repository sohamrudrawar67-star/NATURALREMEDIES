import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Gift, ShieldCheck, Truck, ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react'
import { FESTIVAL_THEMES, FestivalId } from '@/lib/festival'
import { getFestivalConfig } from '@/lib/festival-server'
import { listFestivalProducts } from '@/lib/catalog'
import { ProductCard } from '@/components/ProductCard'
import { WHATSAPP_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getFestivalConfig()
  const theme = FESTIVAL_THEMES[config.festivalId] || FESTIVAL_THEMES.general
  const title = config.customTitle || theme.defaultTitle

  return {
    title: `${title} | Natural Remedies`,
    description: config.customSubtitle || theme.defaultSubtitle,
    alternates: { canonical: '/festival' },
  }
}

export default async function FestivalPage() {
  const config = await getFestivalConfig()
  const products = await listFestivalProducts()
  const theme = FESTIVAL_THEMES[config.festivalId] || FESTIVAL_THEMES.general

  if (!config.isEnabled) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-6 pt-32 text-center pb-24">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-tint text-[28px] border border-primary/20 shadow-xs mb-5">
          🌿
        </div>
        <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.03em] leading-tight">
          No active festive sale right now
        </h1>
        <p className="mt-3 text-[16px] text-muted leading-relaxed max-w-[42ch]">
          Our festive specials are published around major celebrations (Diwali, Holi, Navratri). In the meantime, explore our everyday shelf of authentic herbal goods.
        </p>
        <Link
          href="/products"
          className="press btn-primary mt-8 inline-flex h-12 items-center gap-2 px-7 text-[15px] font-semibold"
        >
          <span>Explore The Shop</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const title = config.customTitle || theme.defaultTitle
  const subtitle = config.customSubtitle || theme.defaultSubtitle
  const badgeText = config.discountBadgeText || theme.badgeText

  return (
    <div className="relative min-h-screen pb-28 pt-28 sm:pt-36 overflow-hidden">
      {/* Dynamic ambient festive gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[650px] transition-all duration-700"
        style={{ background: theme.gradientBg }}
      />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-6">
        {/* Breadcrumb navigation */}
        <div className="enter mb-6 flex items-center gap-2 text-[13px] text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Shop</Link>
          <span>/</span>
          <span className="font-semibold text-primary">{theme.name}</span>
        </div>

        {/* Festive Header Showcase */}
        <header className="enter relative overflow-hidden rounded-[32px] border border-primary/20 bg-surface/75 p-7 sm:p-12 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[700px]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold border ${theme.tagColor} shadow-xs`}>
                  <span>{theme.emoji}</span>
                  <span>{theme.hindiName}</span>
                </span>
                <span className="rounded-full bg-tint px-3 py-1 text-[12px] font-semibold text-primary border border-primary/20">
                  {badgeText}
                </span>
              </div>

              <h1 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[1.02] tracking-[-0.04em] text-foreground">
                {title}
              </h1>

              <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-muted max-w-[58ch]">
                {subtitle}
              </p>

              {/* Highlights pills */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-foreground/80 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-primary" /> Festive Gift Hampers Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> 100% Pure & Authentic
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" /> Pune Store Direct Dispatch
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 pt-2 sm:pt-0">
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hi Natural Remedies! I am inquiring about the ${theme.name} festive offers and gift hampers.`)}`}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[14.5px] font-semibold text-primary-foreground shadow-xs hover:opacity-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Festive Bulk / Gifting Inquiry</span>
              </a>
              <Link
                href="/products"
                className="press inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-surface px-5 text-[14px] font-medium text-foreground hover:bg-surface-2 transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Section Heading */}
        <div className="enter mt-14 sm:mt-18 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.03em] text-foreground">
              Festive Shelf Selection
            </h2>
            <p className="mt-1 text-[14.5px] text-muted">
              Handpicked natural remedies and organic delights published for this festival.
            </p>
          </div>
          <span className="rounded-full bg-tint px-3 py-1 text-[12px] font-semibold text-primary border border-primary/20">
            {products.length} {products.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="mt-12 rounded-[28px] border border-dashed border-line p-12 text-center">
            <p className="text-[16px] text-muted">
              No products are currently in the <strong>Festival Celebrations</strong> category.
            </p>
            <p className="mt-1 text-[13px] text-subtle">
              Admin can assign products to the &apos;Festival Celebrations&apos; category in the Dashboard to feature them here.
            </p>
            <Link href="/products" className="press btn-secondary mt-6 inline-flex h-10 px-5 text-[14px]">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Gifting Banner */}
        <section className="enter mt-20 sm:mt-24 rounded-[32px] border border-primary/20 bg-surface-2/70 p-8 sm:p-12 text-center backdrop-blur-xs">
          <span className="text-[32px]">{theme.emoji}</span>
          <h3 className="mt-2 text-[24px] sm:text-[28px] font-semibold tracking-[-0.03em]">
            Looking for Custom Festive Hampers?
          </h3>
          <p className="mx-auto mt-2 max-w-[50ch] text-[15px] text-muted">
            We prepare customized festive gift boxes with raw wild honey, authentic herbal powders, and natural cosmetics for families and corporate gifting.
          </p>
          <a
            href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hi! I'd like to customize a festive gift pack for ${theme.name}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="press btn-primary mt-6 inline-flex h-11 items-center gap-2 px-6 text-[14.5px]"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Customize on WhatsApp</span>
          </a>
        </section>
      </div>
    </div>
  )
}
