'use client'

import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import type { Product } from '@/store/useCartStore'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'low', label: 'Price: low to high' },
  { key: 'high', label: 'Price: high to low' },
] as const

type SortKey = (typeof SORTS)[number]['key']

export function ShopClient({ products, query }: { products: Product[]; query: string }) {
  const router = useRouter()
  const [sort, setSort] = useState<SortKey>('featured')
  const [draft, setDraft] = useState(query)

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    const filtered = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      : products
    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [products, query, sort])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = draft.trim()
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-32 sm:pt-40">
      <header className="enter flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tint text-tint-foreground text-[12px] font-medium border border-primary/20 mb-3 w-fit shadow-xs">
            🌿 Homegrown & Natural
          </span>
          <h1 className="text-[clamp(44px,7vw,88px)] font-semibold leading-[0.95] tracking-[-0.05em]">
            {query ? (
              <>
                “{query}”
              </>
            ) : (
              <>
                The <em className="font-serif font-normal italic tracking-[-0.02em] text-primary">shop.</em>
              </>
            )}
          </h1>
          <p className="mt-4 text-[17px] text-muted">
            {query
              ? `${visible.length} ${visible.length === 1 ? 'match' : 'matches'}`
              : `${products.length} ${products.length === 1 ? 'thing' : 'things'} on the shelf, ready to send.`}
          </p>
        </div>

        <form onSubmit={submit} className="glass flex h-12 w-full items-center gap-2 rounded-full pl-4 pr-1.5 md:w-[320px] ring-1 ring-primary/20 focus-within:ring-primary">
          <Search className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search natural honey, goods…"
            aria-label="Search the shop"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
          />
          {query && (
            <Link href="/products" onClick={() => setDraft('')} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-foreground/[0.06]" aria-label="Clear search">
              <X className="h-4 w-4" />
            </Link>
          )}
        </form>
      </header>

      <div className="enter mt-10 flex gap-1.5 overflow-x-auto border-b border-line pb-4" style={{ animationDelay: '80ms' }} role="tablist" aria-label="Sort">
        {SORTS.map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={sort === s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              'press relative shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors',
              sort === s.key ? 'text-primary-foreground font-semibold' : 'text-muted hover:text-foreground'
            )}
          >
            {sort === s.key && (
              <motion.span
                layoutId="sort-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-xs"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
              />
            )}
            {s.label}
          </button>
        ))}
      </div>

      <h2 className="sr-only">Products</h2>
      {visible.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 5) * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="enter mx-auto mt-24 flex max-w-sm flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2">
            <Search className="h-6 w-6 text-muted" strokeWidth={1.5} />
          </span>
          <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em]">Nothing by that name</h2>
          <p className="mt-2 text-[15px] text-muted">Try a shorter word, or have a look at everything instead.</p>
          <Link href="/products" onClick={() => setDraft('')} className="press btn-primary mt-6 h-11 px-6 text-[15px]">
            See everything
          </Link>
        </div>
      )}
    </div>
  )
}
