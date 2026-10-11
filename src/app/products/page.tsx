'use client'

import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { useProducts } from '@/lib/useProducts'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useMemo, useState } from 'react'

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'low', label: 'Price: low to high' },
  { key: 'high', label: 'Price: high to low' },
] as const

type SortKey = (typeof SORTS)[number]['key']

export default function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = use(searchParams)
  const query = params.q?.trim() ?? ''
  const router = useRouter()
  const { products, loading } = useProducts()
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
          <h1 className="text-[clamp(44px,7vw,88px)] font-semibold leading-[0.95] tracking-[-0.05em]">
            {query ? (
              <>
                “{query}”
              </>
            ) : (
              <>
                The <em className="font-serif font-normal italic tracking-[-0.02em]">shop.</em>
              </>
            )}
          </h1>
          <p className="mt-4 text-[17px] text-muted">
            {loading
              ? 'Getting the shelf ready…'
              : query
                ? `${visible.length} ${visible.length === 1 ? 'match' : 'matches'}`
                : `${products.length} ${products.length === 1 ? 'thing' : 'things'} on the shelf, ready to send.`}
          </p>
        </div>

        <form onSubmit={submit} className="glass flex h-12 w-full items-center gap-2 rounded-full pl-4 pr-1.5 md:w-[320px]">
          <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search the shop"
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

      <div className="enter mt-10 flex gap-1 overflow-x-auto border-b border-line pb-4" style={{ animationDelay: '80ms' }} role="tablist" aria-label="Sort">
        {SORTS.map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={sort === s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              'press relative shrink-0 rounded-full px-4 py-2 text-[14px] font-medium',
              sort === s.key ? 'text-background' : 'text-muted hover:text-foreground'
            )}
          >
            {sort === s.key && (
              <motion.span
                layoutId="sort-pill"
                className="absolute inset-0 -z-10 rounded-full bg-foreground"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
              />
            )}
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length > 0 ? (
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
