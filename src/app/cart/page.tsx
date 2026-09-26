'use client'

import { useCartStore } from '@/store/useCartStore'
import { Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { useUserStore } from '@/store/useUserStore'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity } = useCartStore()
  const { user, openLoginModal } = useUserStore()

  const handleCheckout = () => {
    if (!user) {
      openLoginModal()
      return
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    let message = `*New Order from ${user.name}*\n`
    message += `Phone: ${user.phone}\n`
    message += `Address: ${user.address}\n\n`
    message += `*Items:*\n`
    
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`
    })
    
    message += `\n*Total: ₹${subtotal}*`
    
    const encodedMessage = encodeURIComponent(message)
    const storeOwnerPhone = '917721008644' // Using the number from your screenshot as default
    
    window.open(`https://wa.me/${storeOwnerPhone}?text=${encodedMessage}`, '_blank')
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading cart...</div>
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-foreground/70 mb-8">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link 
          href="/products" 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border">
                <div className="w-24 h-24 bg-accent rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary">{item.name}</h3>
                  <p className="font-bold mt-1">₹{item.price}</p>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center bg-accent rounded-full">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal ({items.length} items)</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Shipping</span>
                <span className="font-medium">Calculated next</span>
              </div>
              
              <hr className="border-border my-2" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{subtotal}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Proceed to WhatsApp Checkout
            </button>
            <p className="text-xs text-center text-foreground/60 mt-4">
              Shipping and taxes calculated at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
