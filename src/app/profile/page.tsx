'use client'

import { useUserStore } from '@/store/useUserStore'
import { useOrderStore } from '@/store/useOrderStore'
import { useHydrated } from '@/lib/useHydrated'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export default function ProfilePage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const { user, logout, updateProfile, openLoginModal } = useUserStore()
  const { orders } = useOrderStore()
  const [isEditing, setIsEditing] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-36">
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="skeleton mt-6 h-10 w-64 rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="enter mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center px-6 pt-20 text-center">
        <h1 className="text-[clamp(32px,4vw,44px)] font-semibold tracking-[-0.04em]">Nothing saved yet.</h1>
        <p className="mt-3 text-[16px] text-muted">Add your name, number and address once, and checkout becomes a single tap.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={openLoginModal} className="press btn-primary h-12 px-7 text-[15px]">
            Add your details
          </button>
          {orders.length > 0 && (
            <Link href="/orders" className="press btn-secondary h-12 px-6 text-[15px] flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> View previous orders ({orders.length})
            </Link>
          )}
        </div>
      </div>
    )
  }

  const startEdit = () => {
    setName(user.name)
    setPhone(user.phone)
    setAddress(user.address)
    setIsEditing(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) return
    updateProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() })
    setIsEditing(false)
    toast('Details updated')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const initial = user.name.trim().charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-[720px] px-6 pb-24 pt-32 sm:pt-40">
      <div className="enter flex items-center gap-5">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_200deg,var(--primary),#7da846,var(--primary))] p-[3px] shadow-sm">
          <span className="grid h-full w-full place-items-center rounded-full bg-background text-[30px] font-semibold tracking-[-0.03em] text-primary">{initial}</span>
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[clamp(30px,4.4vw,48px)] font-semibold leading-[1] tracking-[-0.045em]">{user.name}</h1>
          <p className="mt-1.5 text-[15px] text-muted">Saved on this device · Homegrown Orders</p>
        </div>
      </div>

      {/* Previous Orders Section */}
      <section className="enter glass mt-10 rounded-[28px] border border-primary/15 p-7 shadow-sm" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Previous orders</h2>
            <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
              {orders.length}
            </span>
          </div>
          <Link
            href="/orders"
            className="press rounded-full px-3 py-1.5 text-[14px] font-medium text-primary hover:bg-primary/10 flex items-center gap-1"
          >
            {orders.length > 0 ? 'View all' : 'Order history'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="mt-5 space-y-3">
            {orders.slice(0, 3).map((o) => (
              <Link
                key={o.id}
                href="/orders"
                className="press flex items-center justify-between p-3.5 rounded-2xl bg-surface-2/60 hover:bg-surface-2 border border-primary/10 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13.5px] font-bold">#{o.id}</span>
                    <span className="text-[11px] text-primary bg-tint px-2 py-0.5 rounded-full font-medium">
                      {o.status || 'Sent on WhatsApp'}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-muted truncate mt-1">
                    {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[15px] font-semibold text-primary tabular-nums">
                    ₹{o.total ?? (o.subtotal + (o.deliveryFee ?? (o.subtotal > 500 ? 70 : 0)))}
                  </div>
                  <div className="text-[11px] text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              </Link>
            ))}
            {orders.length > 3 && (
              <Link
                href="/orders"
                className="block text-center text-[13.5px] text-primary hover:underline font-medium pt-1"
              >
                + {orders.length - 3} more {orders.length - 3 === 1 ? 'order' : 'orders'} in your history
              </Link>
            )}
          </div>
        ) : (
          <p className="mt-4 text-[14.5px] text-muted">
            No previous orders yet. Once you place an order over WhatsApp, your receipt and items will appear here for fast reordering.
          </p>
        )}
      </section>

      {/* Delivery Details Section */}
      <section className="enter glass mt-6 rounded-[28px] border border-primary/15 p-7 shadow-sm" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Delivery details</h2>
          {!isEditing && (
            <button onClick={startEdit} className="press rounded-full px-3 py-1.5 text-[14px] font-medium text-primary hover:bg-primary/10">
              Edit
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isEditing ? (
            <motion.form
              key="edit"
              onSubmit={handleSave}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="mt-6 flex flex-col gap-3"
            >
              <input className="field" aria-label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="field" aria-label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <textarea className="field resize-none" aria-label="Address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
              <div className="mt-2 flex gap-2">
                <button type="submit" className="press btn-primary h-11 flex-1 text-[15px]">
                  Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="press btn-secondary h-11 flex-1 text-[15px]">
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.dl
              key="view"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="mt-4 divide-y divide-line"
            >
              <Row label="Name">{user.name}</Row>
              <Row label="WhatsApp">{user.phone}</Row>
              <Row label="Address">{user.address}</Row>
            </motion.dl>
          )}
        </AnimatePresence>
      </section>

      <div className="enter mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: '160ms' }}>
        <Link href="/orders" className="press rounded-full px-4 py-2 text-[14px] font-medium text-primary hover:bg-primary/10">
          View all previous orders ({orders.length})
        </Link>
        <button onClick={handleLogout} className="press rounded-full px-4 py-2 text-[14px] font-medium text-danger hover:bg-danger/10">
          Log out
        </button>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4 py-4 text-[15px]">
      <dt className="text-muted">{label}</dt>
      <dd className="whitespace-pre-line">{children}</dd>
    </div>
  )
}
