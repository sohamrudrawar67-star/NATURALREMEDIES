'use client'

import { useCartStore, CartItem } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import { useHydrated } from '@/lib/useHydrated'
import { Minus, Plus, X, ShoppingBag, Lock } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { WHATSAPP_URL } from '@/lib/site'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export default function CartPage() {
  const hydrated = useHydrated()
  const { items, removeItem, updateQuantity, addItem } = useCartStore()
  const { user, openLoginModal } = useUserStore()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    if (!user) {
      openLoginModal()
      return
    }

    let message = `*New Order Received!*\n\n`
    message += `*Customer:* ${user.name}\n`
    message += `*Phone:* ${user.phone}\n`
    message += `*Delivery Address:*\n${user.address}\n\n`
    message += `*Order Details:*\n`

    items.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`
    })

    message += `\n*Total Amount:* ₹${subtotal}`

    const encodedMessage = encodeURIComponent(message)
    // External: opens the WhatsApp app / web with the order filled in
    window.open(`${WHATSAPP_URL}?text=${encodedMessage}`, "_self", "noopener")
  }

  const remove = (item: CartItem) => {
    removeItem(item.id)
    toast(`Removed ${item.name}`, {
      action: {
        label: 'Undo',
        onClick: () => {
          addItem(item)
          if (item.quantity > 1) updateQuantity(item.id, item.quantity)
        },
      },
      duration: 4000,
    })
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-36">
        <div className="skeleton h-14 w-64 rounded-2xl" />
        <div className="skeleton mt-10 h-28 w-full rounded-3xl" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="enter mx-auto flex min-h-[78vh] max-w-md flex-col items-center justify-center px-6 pt-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-surface-2">
          <ShoppingBag className="h-8 w-8 text-muted" strokeWidth={1.4} />
        </span>
        <h1 className="mt-8 text-[clamp(32px,4vw,44px)] font-semibold tracking-[-0.04em]">Your basket is empty.</h1>
        <p className="mt-3 text-[16px] text-muted">When you add something, it&rsquo;ll wait here — even if you close the tab.</p>
        <Link href="/products" className="press btn-primary mt-8 h-12 px-7 text-[15px]">
          Go to the shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32 sm:pt-36">
      <h1 className="enter text-[clamp(40px,6vw,72px)] font-semibold leading-[0.95] tracking-[-0.05em]">
        Your <em className="font-serif font-normal italic tracking-[-0.02em]">basket.</em>
      </h1>
      <p className="enter mt-3 text-[16px] text-muted" style={{ animationDelay: '60ms' }}>
        {count} {count === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <ul className="divide-y divide-line border-y border-line">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE_OUT, layout: { duration: 0.3, ease: EASE_OUT } }}
                className="flex items-center gap-4 py-5 sm:gap-6"
              >
                <Link href={`/products/${item.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-surface-2 sm:h-28 sm:w-28">
                  {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/products/${item.id}`} className="block truncate text-[17px] font-semibold tracking-[-0.02em]">
                      {item.name}
                    </Link>
                    <div className="mt-0.5 text-[14px] tabular-nums text-muted">₹{item.price} each</div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex h-9 items-center rounded-full bg-surface-2 px-1">
                      <button
                        onClick={() => (item.quantity === 1 ? remove(item) : updateQuantity(item.id, item.quantity - 1))}
                        className="press grid h-7 w-7 place-items-center rounded-full hover:bg-foreground/[0.07]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </button>
                      <span className="w-7 text-center text-[14px] font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.isOutOfStock}
                        className="press grid h-7 w-7 place-items-center rounded-full hover:bg-foreground/[0.07] disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </button>
                    </div>
                    <span className="w-16 text-right text-[16px] font-medium tabular-nums">₹{item.price * item.quantity}</span>
                    <button
                      onClick={() => remove(item)}
                      className="press grid h-8 w-8 place-items-center rounded-full text-subtle hover:bg-foreground/[0.06] hover:text-foreground"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="enter glass rounded-[28px] p-7 lg:sticky lg:top-28" style={{ animationDelay: '120ms' }}>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em]">Summary</h2>
          <dl className="mt-6 space-y-3 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">₹{subtotal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-primary">Free</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[16px] font-medium">Total</span>
            <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em]">₹{subtotal}</span>
          </div>

          <button onClick={handleCheckout} className="press btn-primary mt-7 h-[52px] w-full text-[16px]">
            <WhatsAppIcon />
            {user ? 'Send order on WhatsApp' : 'Add your details to order'}
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12.5px] text-subtle">
            <Lock className="h-3.5 w-3.5" />
            {user ? `Delivering to ${user.name.split(' ')[0]} · ` : ''}Nothing is charged here
          </p>
        </aside>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
