'use client'

import { Product } from '@/store/useCartStore'
import { cn } from '@/lib/utils'
import { CartQuantityButton } from './CartQuantityButton'
import Link from 'next/link'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  return (
    <div className={cn(
      "group bg-card rounded-2xl shadow-sm hover:shadow-xl border border-border overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col h-full relative",
      className
    )}>
      {/* Image Container with zoom effect */}
      <Link href={`/products/${product.id}`} className="aspect-square bg-accent relative flex items-center justify-center overflow-hidden block">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" 
          />
        ) : (
          <span className="text-muted-foreground text-sm font-medium">No image</span>
        )}
        
        {/* Availability Badge */}
        {product.isOutOfStock && (
          <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full shadow-sm z-10">
            Out of Stock
          </div>
        )}
      </Link>
      
      {/* Content */}
      <div className={cn("p-5 flex flex-col flex-grow gap-2", product.isOutOfStock && "opacity-70")}>
        <Link href={`/products/${product.id}`} className="hover:underline decoration-primary/30 underline-offset-2">
          <h3 className="font-semibold text-[17px] leading-tight text-foreground line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mb-2 flex-grow leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-bold text-lg text-primary tracking-tight">₹{product.price}</span>
          <CartQuantityButton product={product} />
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-square bg-accent/50 w-full" />
      <div className="p-5 flex flex-col flex-grow gap-3">
        <div className="h-5 bg-accent/60 rounded-md w-3/4" />
        <div className="h-3 bg-accent/40 rounded-md w-full mt-1" />
        <div className="h-3 bg-accent/40 rounded-md w-2/3" />
        
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="h-6 bg-accent/60 rounded-md w-16" />
          <div className="h-9 bg-accent/60 rounded-full w-28" />
        </div>
      </div>
    </div>
  )
}
