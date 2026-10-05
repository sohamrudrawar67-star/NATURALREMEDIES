'use client'

import { Product, useCartStore } from '@/store/useCartStore'
import { Plus, Minus, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CartQuantityButtonProps {
  product: Product
  className?: string
  large?: boolean
}

export function CartQuantityButton({ product, className, large = false }: CartQuantityButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { items, addItem, updateQuantity, removeItem } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className={cn(
        "bg-primary text-primary-foreground rounded-full font-medium transition-colors opacity-0",
        large ? "px-8 py-4 font-bold text-lg" : "px-4 py-2 text-sm",
        className
      )}>
        Loading...
      </button>
    )
  }

  if (product.isOutOfStock) {
    return (
      <button
        disabled
        className={cn(
          "bg-gray-200 text-gray-500 rounded-full font-medium cursor-not-allowed",
          large ? "px-8 py-4 font-bold text-lg" : "px-4 py-2 text-sm",
          className
        )}
      >
        Out of Stock
      </button>
    )
  }

  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = () => {
    addItem(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          "bg-primary text-primary-foreground rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-1.5",
          "hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md active:scale-95",
          justAdded ? "bg-green-600 hover:bg-green-600 text-white" : "",
          large ? "px-8 py-4 font-bold text-lg shadow-sm w-full max-w-sm" : "px-4 py-2 text-sm w-28",
          className
        )}
      >
        {justAdded ? (
          <>
            <Check className={large ? "w-5 h-5" : "w-4 h-4"} />
            {large ? "Added to Cart" : "Added"}
          </>
        ) : (
          large ? `Add to Cart - ₹${product.price}` : 'Add to Cart'
        )}
      </button>
    )
  }

  const handleDecrement = () => {
    if (quantity === 1) {
      removeItem(product.id)
    } else {
      updateQuantity(product.id, quantity - 1)
    }
  }

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1)
  }

  return (
    <div className={cn(
      "bg-secondary text-secondary-foreground rounded-full font-bold flex items-center justify-between border border-primary/10",
      large ? "px-4 py-3 w-48 shadow-sm" : "px-2 py-1.5 w-28",
      className
    )}>
      <button 
        onClick={handleDecrement}
        className="hover:bg-primary/20 hover:text-primary rounded-full p-1 transition-colors active:scale-90 flex items-center justify-center"
      >
        <Minus className={large ? "w-5 h-5" : "w-4 h-4"} />
      </button>
      
      <span className={cn(
        "tabular-nums font-bold",
        large ? "text-lg" : "text-sm"
      )}>
        {quantity}
      </span>
      
      <button 
        onClick={handleIncrement}
        className="hover:bg-primary/20 hover:text-primary rounded-full p-1 transition-colors active:scale-90 flex items-center justify-center"
      >
        <Plus className={large ? "w-5 h-5" : "w-4 h-4"} />
      </button>
    </div>
  )
}
