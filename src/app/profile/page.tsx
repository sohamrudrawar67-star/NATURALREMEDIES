'use client'

import { useUserStore } from '@/store/useUserStore'
import { useHydrated } from '@/lib/useHydrated'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export default function ProfilePage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const { user, logout, updateProfile, openLoginModal } = useUserStore()
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
        <button onClick={openLoginModal} className="press btn-primary mt-8 h-12 px-7 text-[15px]">
          Add your details
        </button>
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

      <section className="enter glass mt-10 rounded-[28px] border border-primary/15 p-7 shadow-sm" style={{ animationDelay: '80ms' }}>
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

      <div className="enter mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: '140ms' }}>
        <span />
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
