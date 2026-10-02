'use client'

import { Product, useCartStore } from '@/store/useCartStore'
import { cn } from '@/lib/utils'
import { CartQuantityButton } from './CartQuantityButton'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <div className={cn("bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow", className)}>
      <div className="aspect-square bg-accent relative flex items-center justify-center overflow-hidden">
        {/* We use a simple img tag with object-cover here, but could use Next.js Image later */}
        {product.image ? (
          <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
        ) : (
          <span className="text-muted-foreground">No image</span>
        )}
        {product.isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
            Out of Stock
          </div>
        )}
      </div>
      <div className={`p-5 flex flex-col gap-3 ${product.isOutOfStock ? 'opacity-70' : ''}`}>
        <h3 className="font-semibold text-lg text-primary">{product.name}</h3>
        <p className="text-sm text-foreground/80 line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-xl">₹{product.price}</span>
          <CartQuantityButton product={product} />
        </div>
      </div>
    </div>
  )
}
