'use client'

import { Product, useCartStore } from '@/store/useCartStore'
import { Plus, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CartQuantityButtonProps {
  product: Product
  className?: string
  large?: boolean
}

export function CartQuantityButton({ product, className, large = false }: CartQuantityButtonProps) {
  const [mounted, setMounted] = useState(false)
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

  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  if (quantity === 0) {
    return (
      <button
        onClick={() => addItem(product)}
        className={cn(
          "bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors",
          large ? "px-8 py-4 font-bold text-lg shadow-md" : "px-4 py-2 text-sm",
          className
        )}
      >
        {large ? `Add to Cart - ₹${product.price}` : 'Add to Cart'}
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
      "bg-primary text-primary-foreground rounded-full font-bold flex items-center justify-between",
      large ? "px-4 py-4 w-48 shadow-md" : "px-3 py-2 w-28",
      className
    )}>
      <button 
        onClick={handleDecrement}
        className="hover:bg-black/10 rounded-full p-1 transition-colors"
      >
        <Minus className={large ? "w-6 h-6" : "w-4 h-4"} />
      </button>
      
      <span className={cn(
        "tabular-nums font-bold",
        large ? "text-xl" : "text-base"
      )}>
        {quantity}
      </span>
      
      <button 
        onClick={handleIncrement}
        className="hover:bg-black/10 rounded-full p-1 transition-colors"
      >
        <Plus className={large ? "w-6 h-6" : "w-4 h-4"} />
      </button>
    </div>
  )
}
