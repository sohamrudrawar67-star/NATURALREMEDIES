'use client'

import { useOrderStore, Order } from '@/store/useOrderStore'
import { useCartStore, productHref } from '@/store/useCartStore'
import { useHydrated } from '@/lib/useHydrated'
import { Clock, ShoppingBag, RotateCcw, MessageCircle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { WHATSAPP_URL } from '@/lib/site'

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const { orders } = useOrderStore()
  const { addItem, updateQuantity } = useCartStore()

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        slug: item.slug,
      })
      if (item.quantity > 1) {
        updateQuantity(item.id, item.quantity)
      }
    })
    toast.success(`Items from #${order.id} added to basket!`, {
      action: {
        label: 'View basket',
        onClick: () => router.push('/cart'),
      },
    })
    router.push('/cart')
  }

  const handleWhatsAppQuery = (order: Order) => {
    const message = encodeURIComponent(
      `*Query regarding Order #${order.id}*\n\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Total:* ₹${order.subtotal}\n` +
      `*Date:* ${formatDate(order.createdAt)}\n\n` +
      `Hi Natural Remedies, I would like to check the status of my order.`
    )
    window.open(`${WHATSAPP_URL}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[960px] px-6 pb-24 pt-36">
        <div className="skeleton h-12 w-64 rounded-2xl" />
        <div className="skeleton mt-8 h-40 w-full rounded-3xl" />
        <div className="skeleton mt-6 h-40 w-full rounded-3xl" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="enter mx-auto flex min-h-[78vh] max-w-md flex-col items-center justify-center px-6 pt-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-tint border border-primary/20 text-primary">
          <Clock className="h-8 w-8" strokeWidth={1.5} />
        </span>
        <h1 className="mt-8 text-[clamp(32px,4vw,44px)] font-semibold tracking-[-0.04em]">No previous orders yet.</h1>
        <p className="mt-3 text-[16px] text-muted leading-relaxed">
          When you send an order on WhatsApp, a receipt will be saved right here on this device for easy tracking and reordering.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/products" className="press btn-primary h-12 px-7 text-[15px]">
            Browse the shop
          </Link>
          <Link href="/cart" className="press btn-secondary h-12 px-6 text-[15px]">
            Check your basket
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[960px] px-6 pb-24 pt-32 sm:pt-36">
      <nav aria-label="Breadcrumb" className="enter mb-4">
        <ol className="flex items-center gap-1.5 text-[13.5px] text-muted">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5 text-subtle" />
          </li>
          <li>
            <Link href="/cart" className="hover:text-foreground transition-colors">
              Basket
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5 text-subtle" />
          </li>
          <li aria-current="page" className="text-foreground font-medium">
            Previous orders
          </li>
        </ol>
      </nav>

      <div className="enter inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint/80 px-3.5 py-1 text-[12.5px] font-medium text-primary backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Order Receipts & WhatsApp Dispatch History
      </div>

      <div className="enter flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-3">
        <div>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-semibold leading-[0.98] tracking-[-0.045em]">
            Previous <em className="font-serif font-normal italic tracking-[-0.02em] text-primary">orders.</em>
          </h1>
          <p className="mt-3 text-[16px] text-muted">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} saved on this device
          </p>
        </div>
        <Link
          href="/products"
          className="link-arrow text-[14.5px] font-medium w-fit sm:pb-2"
        >
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 space-y-6">
        {orders.map((order, idx) => (
          <div
            key={order.id}
            className="enter glass rounded-[26px] border border-primary/15 p-6 sm:p-7 shadow-xs hover:border-primary/30 transition-colors"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Order Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[15px] font-bold text-foreground">
                  #{order.id}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tint px-2.5 py-0.5 text-[12px] font-medium text-primary border border-primary/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {order.status || 'Sent on WhatsApp'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-muted">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {/* Customer Details Snippet */}
            <div className="py-3 text-[13px] text-muted border-b border-line/60 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <strong className="text-foreground font-medium">To:</strong> {order.customerName} ({order.customerPhone})
              </span>
              <span>·</span>
              <span className="truncate max-w-[420px]">{order.customerAddress}</span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-line/60 py-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-primary/15">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-muted m-auto" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={productHref(item)}
                        className="truncate block text-[15px] font-semibold hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="text-[12.5px] text-muted tabular-nums">
                        {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[15px] font-semibold tabular-nums text-foreground">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Actions */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-line pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] text-muted">Order Total:</span>
                <span className="text-[22px] font-bold tabular-nums text-primary">₹{order.subtotal}</span>
                <span className="text-[12px] text-muted">({order.totalItems || order.items.reduce((s, i) => s + i.quantity, 0)} items · Free delivery)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleWhatsAppQuery(order)}
                  className="press inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-tint/60 px-4 py-2 text-[13.5px] font-medium text-primary hover:bg-tint transition-colors"
                  title="Chat about this order on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask on WhatsApp
                </button>
                <button
                  onClick={() => handleReorder(order)}
                  className="press btn-primary h-9 px-4 text-[13.5px] font-medium flex items-center gap-1.5"
                  title="Add items to basket again"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reorder
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
