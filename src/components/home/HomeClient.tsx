'use client'

import { useEffect, useState } from 'react'
import { HeroScroll } from '@/components/home/HeroScroll'
import { StatementReveal } from '@/components/home/StatementReveal'
import { ProductCoverflow } from '@/components/home/ProductCoverflow'
import { HowToOrder } from '@/components/home/HowToOrder'
import { ClosingFrame } from '@/components/home/ClosingFrame'
import { MobileHomeLock } from '@/components/home/MobileHomeLock'
import type { Product } from '@/store/useCartStore'

/** Interactive home page. Products arrive server-rendered, so crawlers see them too. */
export function HomeClient({
  products,
  faqs,
  faq,
}: {
  products: Product[]
  faqs?: { q: string; a: string }[]
  faq: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <>
      {/* Mobile experience: Screen-locked slides with 3D transitions */}
      {mounted && isMobile ? (
        <div className="block md:hidden">
          <MobileHomeLock products={products} faqs={faqs} />
        </div>
      ) : null}

      {/* Desktop experience: 100% UNTOUCHED existing layout */}
      <div className={`flex flex-col ${mounted && isMobile ? 'hidden' : ''}`}>
        <HeroScroll products={products} />
        <StatementReveal
          text="Natural Remedies is a small, homegrown brand. We keep the shelf short and ordering simple — pick what you need, send us a message, and get on with your day."
          emphasis={['homegrown', 'short']}
        />
        <ProductCoverflow products={products} />
        <HowToOrder products={products} />
        {faq}
        <ClosingFrame image={[...products].sort((a, b) => b.price - a.price)[0]?.image} />
      </div>
    </>
  )
}
