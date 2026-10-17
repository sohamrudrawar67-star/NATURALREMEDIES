'use client'

import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import type { Product } from '@/store/useCartStore'
import { PRODUCT_CATEGORIES, ProductCategory } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Search, X, Sparkles, Filter } from 'lucide-react'
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('featured')
  const [draft, setDraft] = useState(query)

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      const cat = p.category || 'Miscellaneous Products'
      counts[cat] = (counts[cat] || 0) + 1
    }
    return counts
  }, [products])

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    let filtered = products

    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => (p.category || 'Miscellaneous Products') === selectedCategory)
    }

    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [products, query, selectedCategory, sort])

  // Grouped products by category for segmented view
  const categoryGroups = useMemo(() => {
    if (selectedCategory !== 'all' || query) return null

    const groups: { category: string; items: Product[] }[] = []
    const allCategories = [...PRODUCT_CATEGORIES]

    for (const cat of allCategories) {
      let items = products.filter((p) => (p.category || 'Miscellaneous Products') === cat)
      if (items.length > 0) {
        if (sort === 'low') items = [...items].sort((a, b) => a.price - b.price)
        if (sort === 'high') items = [...items].sort((a, b) => b.price - a.price)
        groups.push({ category: cat, items })
      }
    }

    // Add any products that might have a category not in standard list
    const otherItems = products.filter(
      (p) => p.category && !(PRODUCT_CATEGORIES as readonly string[]).includes(p.category)
    )
    if (otherItems.length > 0) {
      groups.push({ category: 'Other Products', items: otherItems })
    }

    return groups
  }, [products, selectedCategory, query, sort])

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
            🌿 Homegrown & Natural Catalog
          </span>
          <h1 className="text-[clamp(44px,7vw,88px)] font-semibold leading-[0.95] tracking-[-0.05em]">
            {query ? (
              <>“{query}”</>
            ) : (
              <>
                The <em className="font-serif font-normal italic tracking-[-0.02em] text-primary">shop.</em>
              </>
            )}
          </h1>
          <p className="mt-4 text-[17px] text-muted">
            {query
              ? `${visible.length} ${visible.length === 1 ? 'match' : 'matches'}`
              : selectedCategory !== 'all'
              ? `${visible.length} in ${selectedCategory}`
              : `${products.length} natural product${products.length === 1 ? '' : 's'} on the shelf, ready to dispatch.`}
          </p>
        </div>

        <form onSubmit={submit} className="glass flex h-12 w-full items-center gap-2 rounded-full pl-4 pr-1.5 md:w-[320px] ring-1 ring-primary/20 focus-within:ring-primary">
          <Search className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search herbal powder, medicine..."
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

      {/* CATEGORY SELECTOR TABS */}
      <div className="enter mt-10 space-y-3" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Categories</span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[12.5px] font-medium text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 text-[13.5px]" role="tablist" aria-label="Categories">
          {/* All tab */}
          <button
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'press relative shrink-0 rounded-full px-4 py-2 font-medium transition-all flex items-center gap-1.5',
              selectedCategory === 'all'
                ? 'text-primary-foreground font-semibold shadow-xs'
                : 'bg-surface-2/80 text-muted hover:text-foreground border border-line'
            )}
          >
            {selectedCategory === 'all' && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
              />
            )}
            <span>All Products</span>
            <span className={cn('text-[11px] rounded-full px-1.5 py-0.2', selectedCategory === 'all' ? 'bg-white/20' : 'bg-surface')}>
              {products.length}
            </span>
          </button>

          {/* Specific category tabs */}
          {PRODUCT_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'press relative shrink-0 rounded-full px-4 py-2 font-medium transition-all flex items-center gap-1.5',
                  isSelected
                    ? 'text-primary-foreground font-semibold shadow-xs'
                    : 'bg-surface-2/80 text-muted hover:text-foreground border border-line'
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
                  />
                )}
                <span>{cat}</span>
                {count > 0 && (
                  <span className={cn('text-[11px] rounded-full px-1.5 py-0.2', isSelected ? 'bg-white/20' : 'bg-surface')}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* SORT CONTROLS */}
      <div className="mt-6 flex items-center justify-between border-b border-line pb-4" role="tablist" aria-label="Sort">
        <div className="flex gap-1.5 overflow-x-auto">
          {SORTS.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={sort === s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                'press shrink-0 rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
                sort === s.key ? 'bg-tint text-primary font-semibold border border-primary/25' : 'text-muted hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <h2 className="sr-only">Products</h2>

      {/* PRODUCTS DISPLAY */}
      {categoryGroups && categoryGroups.length > 0 ? (
        // SEGMENTED CATEGORY-WISE DISPLAY (When viewing all products without search query)
        <div className="mt-8 space-y-16">
          {categoryGroups.map((group, groupIdx) => (
            <section key={group.category} className="enter" style={{ animationDelay: `${groupIdx * 50}ms` }}>
              {/* Category Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5 mb-8">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.03em] text-foreground">
                    {group.category}
                  </h2>
                  <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11.5px] font-medium text-primary border border-primary/20">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategory(group.category)}
                  className="press text-[13px] font-medium text-primary hover:underline"
                >
                  View only {group.category} →
                </button>
              </div>

              {/* Category Products Grid */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((product, i) => (
                  <Reveal key={product.id} delay={Math.min(i, 4) * 50}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : visible.length > 0 ? (
        // FILTERED OR SEARCH RESULTS GRID
        <div className="mt-12">
          {selectedCategory !== 'all' && (
            <div className="mb-8 flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-foreground">
                {selectedCategory}
              </h2>
              <span className="text-[13.5px] text-muted">
                {visible.length} {visible.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i, 5) * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      ) : (
        // EMPTY STATE
        <div className="enter mx-auto mt-24 flex max-w-sm flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2">
            <Search className="h-6 w-6 text-muted" strokeWidth={1.5} />
          </span>
          <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em]">No products found</h2>
          <p className="mt-2 text-[15px] text-muted">
            {selectedCategory !== 'all'
              ? `There are no products under "${selectedCategory}" right now.`
              : 'Try a shorter word, or have a look at everything instead.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setDraft('')
              router.push('/products')
            }}
            className="press btn-primary mt-6 h-11 px-6 text-[15px]"
          >
            See all products
          </button>
        </div>
      )}
    </div>
  )
}
