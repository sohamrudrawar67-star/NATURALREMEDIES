'use client'

import { useEffect, useState } from 'react'
import { HeroScroll } from '@/components/home/HeroScroll'
import { StatementReveal } from '@/components/home/StatementReveal'
import { HowToOrder } from '@/components/home/HowToOrder'
import { ClosingFrame } from '@/components/home/ClosingFrame'
import { MobileHomeLock } from '@/components/home/MobileHomeLock'
import { getProducts } from '@/lib/products'
import type { Product } from '@/store/useCartStore'

/** Interactive home page. Products arrive server-rendered and refresh on mount. */
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
  const [items, setItems] = useState<Product[]>(products)

  useEffect(() => {
    setItems(products)
  }, [products])

  useEffect(() => {
    // Keep products synchronized in real time when admin adds or modifies products
    getProducts({ fresh: true }).then((fresh) => {
      if (fresh && fresh.length > 0) setItems(fresh)
    })
  }, [])

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
          <MobileHomeLock products={items} faqs={faqs} />
        </div>
      ) : null}

      {/* Desktop experience */}
      <div className={`flex flex-col ${mounted && isMobile ? 'hidden' : ''}`}>
        <HeroScroll products={items} />
        <StatementReveal
          text="Natural Remedies is a small, homegrown brand. We keep the shelf short and ordering simple — pick what you need, send us a message, and get on with your day."
          emphasis={['homegrown', 'short']}
        />
        <HowToOrder products={items} />
        {faq}
        <ClosingFrame image={[...items].sort((a, b) => b.price - a.price)[0]?.image} />
      </div>
    </>
  )
}
