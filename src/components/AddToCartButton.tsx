'use client'

import { Product, useCartStore } from '@/store/useCartStore'

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <button
      onClick={() => addItem(product)}
      className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors shadow-md"
    >
      Add to Cart - ₹{product.price}
    </button>
  )
}
