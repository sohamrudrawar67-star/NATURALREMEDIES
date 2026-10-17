'use client'

import { Product, productHref, calculateDiscount } from '@/store/useCartStore'
import { cn } from '@/lib/utils'
import { CartQuantityButton } from './CartQuantityButton'
import Link from 'next/link'
import Image from 'next/image'
import { Images } from 'lucide-react'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const discount = calculateDiscount(product.price, product.cutPrice)
  const imageCount = product.images && product.images.length > 0 ? product.images.length : product.image ? 1 : 0

  return (
    <article className={cn('group flex flex-col', className)}>
      <Link
        href={productHref(product)}
        prefetch={true}
        className="relative block aspect-[4/5] overflow-hidden rounded-[26px] bg-surface-2 ring-1 ring-primary/15 hover:ring-primary/40 dark:ring-primary/25 active:scale-[0.98] transition-all shadow-xs"
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

        {/* Attention-Grabbing Discount Badge (Reference Match) */}
        {discount > 0 && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-bold tracking-tight text-white shadow-md backdrop-blur-xs ring-1 ring-white/25">
            <span>{discount}% OFF</span>
          </div>
        )}

        {/* Multiple Photos Indicator */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10.5px] font-medium text-white backdrop-blur-md">
            <Images className="h-3 w-3" />
            <span>{imageCount} photos</span>
          </div>
        )}

        {product.isOutOfStock && (
          <span className="glass absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[11.5px] font-medium text-foreground">Sold out</span>
        )}
      </Link>

      <div className="flex items-start justify-between gap-4 px-1 pt-3.5">
        <div className="min-w-0 flex-1">
          {product.category && (
            <p className="mb-1 text-[11.5px] font-medium text-primary tracking-tight">
              {product.category}
            </p>
          )}
          <Link href={productHref(product)} prefetch={true}>
            <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em] hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-[14px] leading-[1.45] text-muted">{product.description}</p>
          )}
        </div>

        {/* Price & Cut Price (MRP) */}
        <div className="flex shrink-0 flex-col items-end pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[17px] font-bold tabular-nums text-primary">₹{product.price}</span>
            {product.cutPrice && product.cutPrice > product.price && (
              <span className="text-[13px] line-through tabular-nums text-muted/80">₹{product.cutPrice}</span>
            )}
          </div>
        </div>
      </div>
      <div className="px-1 pt-3.5">
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
