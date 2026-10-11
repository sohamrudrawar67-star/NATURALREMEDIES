'use client'

import { HeroScroll } from '@/components/home/HeroScroll'
import { StatementReveal } from '@/components/home/StatementReveal'
import { ProductCoverflow } from '@/components/home/ProductCoverflow'
import { HowToOrder } from '@/components/home/HowToOrder'
import { ClosingFrame } from '@/components/home/ClosingFrame'
import { useProducts } from '@/lib/useProducts'

export default function Home() {
  const { products, loading } = useProducts()

  return (
    <div className="flex flex-col">
      <HeroScroll products={products} />
      <StatementReveal
        text="Natural Remedies is a small, homegrown brand. We keep the shelf short and ordering simple — pick what you need, send us a message, and get on with your day."
        emphasis={['homegrown', 'short']}
      />
      {!loading && <ProductCoverflow products={products} />}
      <HowToOrder products={products} />
      <ClosingFrame image={[...products].sort((a, b) => b.price - a.price)[0]?.image} />
    </div>
  )
}
