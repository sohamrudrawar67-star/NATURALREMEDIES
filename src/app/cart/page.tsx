'use client'

import { useCartStore, CartItem, productHref } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import { useOrderStore, calculateCourierFee } from '@/store/useOrderStore'
import { useHydrated } from '@/lib/useHydrated'
import { Minus, Plus, X, ShoppingBag, Lock, Clock, CheckCircle2, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { WHATSAPP_URL } from '@/lib/site'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export default function CartPage() {
  const hydrated = useHydrated()
  const { items, removeItem, updateQuantity, addItem, clearCart } = useCartStore()
  const { user, openLoginModal } = useUserStore()
  const { orders, addOrder } = useOrderStore()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const courierCharge = calculateCourierFee(subtotal)
  const total = subtotal + courierCharge

  const handleCheckout = () => {
    if (!user) {
      openLoginModal()
      return
    }

    // 1. Record the order in previous orders history
    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      slug: item.slug,
    }))

    const newOrder = addOrder({
      items: orderItems,
      subtotal,
      deliveryFee: courierCharge,
      total,
      totalItems: count,
      customerName: user.name,
      customerPhone: user.phone,
      customerAddress: user.address,
      status: 'Sent on WhatsApp',
    })

    // 2. Prepare formatted WhatsApp message with Order ID and Courier breakdown
    let message = `*New Order Received!* (#${newOrder.id})\n\n`
    message += `*Customer:* ${user.name}\n`
    message += `*Phone:* ${user.phone}\n`
    message += `*Delivery Address:*\n${user.address}\n\n`
    message += `*Order Items:*\n`

    items.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`
    })

    message += `\n*Subtotal:* ₹${subtotal}\n`
    if (courierCharge > 0) {
      message += `*Courier Delivery Charge:* ₹${courierCharge} (cart above ₹500)\n`
    } else {
      message += `*Courier Delivery:* Free\n`
    }
    message += `*Total Amount:* ₹${total}\n*Order ID:* #${newOrder.id}`

    // 3. Clear the cart immediately so it's empty after order is sent
    clearCart()

    // 4. Notify customer that receipt has been saved
    toast.success(`Order #${newOrder.id} sent on WhatsApp!`, {
      description: 'Your basket has been cleared. View receipt in previous orders anytime.',
      duration: 6000,
    })

    // 5. Open WhatsApp in app / web
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `${WHATSAPP_URL}?text=${encodedMessage}`
    const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = whatsappUrl
    }
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
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
          <Link href="/products" className="press btn-primary h-12 px-7 text-[15px] flex items-center justify-center">
            Go to the shop
          </Link>
          {orders.length > 0 && (
            <Link
              href="/orders"
              className="press btn-secondary h-12 px-6 text-[15px] flex items-center justify-center gap-2"
            >
              <Clock className="h-4 w-4 text-primary" />
              View previous orders ({orders.length})
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32 sm:pt-36">
      <div className="enter inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint/80 px-3.5 py-1 text-[12.5px] font-medium text-primary backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Direct Herbal Order · Direct WhatsApp Dispatch
      </div>
      <h1 className="enter mt-3 text-[clamp(40px,6vw,72px)] font-semibold leading-[0.95] tracking-[-0.05em]">
        Your <em className="font-serif font-normal italic tracking-[-0.02em] text-primary">basket.</em>
      </h1>
      <div className="enter mt-3 flex items-center justify-between gap-4" style={{ animationDelay: '60ms' }}>
        <p className="text-[16px] text-muted">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
        <Link
          href="/orders"
          className="press inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface px-3.5 py-1 text-[13px] font-medium text-muted hover:text-primary transition-colors"
        >
          <Clock className="h-3.5 w-3.5 text-primary" />
          Previous orders{orders.length > 0 ? ` (${orders.length})` : ''}
        </Link>
      </div>

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
                <Link href={productHref(item)} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-surface-2 ring-1 ring-primary/15 sm:h-28 sm:w-28">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={productHref(item)} className="block truncate text-[17px] font-semibold tracking-[-0.02em] hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                    <div className="mt-0.5 text-[14px] tabular-nums text-muted">₹{item.price} each</div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex h-9 items-center rounded-full bg-surface-2 border border-primary/10 px-1">
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
                    <span className="w-16 text-right text-[16px] font-semibold tabular-nums text-primary">₹{item.price * item.quantity}</span>
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

        <aside className="enter glass rounded-[28px] border border-primary/15 p-7 shadow-sm lg:sticky lg:top-28" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold tracking-[-0.025em]">Summary</h2>
            <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
              100% Herbal & Raw
            </span>
          </div>
          <dl className="mt-6 space-y-3 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums font-medium">₹{subtotal}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="flex items-center gap-1.5 text-muted">
                <span>Courier Delivery</span>
                {courierCharge > 0 ? (
                  <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10.5px] font-semibold px-2 py-0.2">
                    Cart &gt; ₹500
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-semibold px-2 py-0.2">
                    Free
                  </span>
                )}
              </dt>
              <dd className="tabular-nums font-semibold">
                {courierCharge > 0 ? (
                  <span>₹{courierCharge}</span>
                ) : (
                  <span className="text-primary font-medium">Free</span>
                )}
              </dd>
            </div>
          </dl>

          {/* Courier Policy Notice */}
          <div className="mt-4">
            {courierCharge > 0 ? (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-[12px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <Truck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  <strong>Courier charge added:</strong> A nominal ₹70 courier fee is added on orders above ₹500.
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-primary/20 bg-tint/60 p-3 text-[12px] text-primary flex items-start gap-2">
                <Truck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Free Delivery:</strong> Orders up to ₹500 ship free (₹70 courier charge applies above ₹500).
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[16px] font-medium">Total</span>
            <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-primary">₹{total}</span>
          </div>

          <button onClick={handleCheckout} className="press btn-primary mt-7 h-[52px] w-full text-[16px] shadow-sm">
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
