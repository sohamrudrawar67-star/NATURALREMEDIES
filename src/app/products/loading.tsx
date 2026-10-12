import { ProductCardSkeleton } from '@/components/ProductCard'

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-32 sm:pt-40">
      <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[clamp(44px,7vw,88px)] font-semibold leading-[0.95] tracking-[-0.05em]">
            The <em className="font-serif font-normal italic tracking-[-0.02em]">shop.</em>
          </h1>
          <p className="mt-4 text-[17px] text-muted">Opening our shelf…</p>
        </div>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
