'use client'

import { Product, productHref } from '@/store/useCartStore'
import { cn } from '@/lib/utils'
import { CartQuantityButton } from './CartQuantityButton'
import Link from 'next/link'
import Image from 'next/image'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  return (
    <article className={cn('group flex flex-col', className)}>
      <Link
        href={productHref(product)}
        className="relative block aspect-[4/5] overflow-hidden rounded-[26px] bg-surface-2 ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]',
              product.isOutOfStock && 'grayscale-[0.6] opacity-80'
            )}
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-sm text-muted">No photo yet</span>
        )}
        {product.isOutOfStock && (
          <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[11.5px] font-medium">Sold out</span>
        )}
      </Link>

      <div className="flex items-start justify-between gap-4 px-1 pt-4">
        <div className="min-w-0">
          <Link href={productHref(product)}>
            <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em]">{product.name}</h3>
          </Link>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-[14px] leading-[1.45] text-muted">{product.description}</p>
          )}
        </div>
        <span className="shrink-0 pt-0.5 text-[16px] font-medium tabular-nums">₹{product.price}</span>
      </div>
      <div className="px-1 pt-4">
        <CartQuantityButton product={product} />
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[4/5] rounded-[26px]" />
      <div className="skeleton mt-4 h-4 w-2/3 rounded-md" />
      <div className="skeleton mt-2 h-3 w-full rounded-md" />
      <div className="skeleton mt-4 h-9 w-[104px] rounded-full" />
    </div>
  )
}
