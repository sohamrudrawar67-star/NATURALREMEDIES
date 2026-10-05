'use client'

import { useCartStore } from '@/store/useCartStore'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
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
    
    let message = `*New Order Received!*\n\n`
    message += `*Customer:* ${user.name}\n`
    message += `*Phone:* ${user.phone}\n`
    message += `*Delivery Address:*\n${user.address}\n\n`
    message += `*Order Details:*\n`
    
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`
    })
    
    message += `\n*Total Amount:* ₹${subtotal}`
    
    const encodedMessage = encodeURIComponent(message)
    const storeOwnerPhone = '917721008644'
    
    window.location.href = `https://wa.me/${storeOwnerPhone}?text=${encodedMessage}`
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="container mx-auto px-4 py-32 text-center animate-pulse"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mb-8">
           <ShoppingBag className="w-16 h-16 text-primary/50" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-10 text-lg">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link 
          href="/products" 
          className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-10">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {items.map((item) => (
              <div key={item.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <Link href={`/products/${item.id}`} className="w-28 h-28 bg-accent/30 rounded-2xl overflow-hidden shrink-0 block relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">No image</div>
                  )}
                </Link>
                
                <div className="flex-1 flex flex-col justify-center">
                  <Link href={`/products/${item.id}`} className="hover:underline decoration-primary/30 underline-offset-2">
                    <h3 className="font-bold text-xl text-foreground line-clamp-1">{item.name}</h3>
                  </Link>
                  <p className="font-extrabold text-primary text-lg mt-1">₹{item.price}</p>
                </div>

                <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-secondary text-secondary-foreground rounded-full border border-primary/10">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2.5 hover:bg-primary/20 hover:text-primary rounded-full transition-colors active:scale-90 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.isOutOfStock}
                      className="p-2.5 hover:bg-primary/20 hover:text-primary rounded-full transition-colors active:scale-90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:active:scale-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-90"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-2xl font-extrabold text-foreground mb-8">Order Summary</h2>
            
            <div className="flex flex-col gap-5 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Subtotal ({items.length} items)</span>
                <span className="font-bold text-lg">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              
              <hr className="border-gray-200 my-2" />
              
              <div className="flex justify-between items-center text-xl font-extrabold">
                <span className="text-foreground">Total</span>
                <span className="text-primary text-2xl">₹{subtotal}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Checkout with WhatsApp
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <p className="text-[13px] text-center text-muted-foreground mt-4 font-medium flex items-center justify-center gap-1.5">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
