'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useUserStore } from '@/store/useUserStore'
import { X, Loader2 } from 'lucide-react'
import { saveCustomer } from '@/app/actions'
import { toast } from 'sonner'

const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const login = useUserStore((state) => state.login)
  const reduceMotion = useReducedMotion()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !loading && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, loading, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = name.trim().replace(/\s+/g, ' ')
    const cleanAddress = address.trim()
    const digits = phone.replace(/\D/g, '')
    if (!cleanName || !digits || !cleanAddress) {
      setError('Please fill in all three.')
      return
    }
    if (digits.length < 10 || digits.length > 13) {
      setError('Enter a 10-digit mobile number — we need it to reach you on WhatsApp.')
      return
    }
    if (cleanName.length > 80 || cleanAddress.length > 400) {
      setError('That’s a bit long — please shorten it.')
      return
    }

    setLoading(true)
    setError('')
    const profile = { name: cleanName, phone: phone.trim(), address: cleanAddress }

    // A copy for the shop. Nice to have; ordering only needs the details on this device.
    await saveCustomer(profile).catch(() => {})

    login(profile)
    toast(`Thanks, ${cleanName.split(' ')[0]}.`, { description: 'Your details are saved on this device.' })
    setLoading(false)
    onClose()
  }

  const panelMotion = isMobile
    ? {
        initial: { transform: 'translateY(100%)' },
        animate: { transform: 'translateY(0%)' },
        exit: { transform: 'translateY(100%)', transition: { duration: 0.22, ease: EASE_DRAWER } },
      }
    : {
        initial: { opacity: 0, transform: 'scale(0.96)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 0, transform: 'scale(0.97)', transition: { duration: 0.15 } },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <motion.div
            className="absolute inset-0 bg-black/35 backdrop-blur-[6px] dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.25 }}
            onClick={() => !loading && onClose()}
          />
          <motion.div
            {...panelMotion}
            transition={reduceMotion ? { duration: 0 } : { duration: isMobile ? 0.4 : 0.26, ease: EASE_DRAWER }}
            className="glass-strong relative w-full max-w-[440px] rounded-t-[30px] border border-primary/15 p-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[30px]"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/15 sm:hidden" aria-hidden />
            <button
              onClick={onClose}
              disabled={loading}
              className="press absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-[18px] w-[18px]" />
            </button>

            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white ring-2 ring-primary/25 shadow-sm">
              <Image src="/logo.png" alt="" width={40} height={36} className="h-10 w-10 object-contain" />
            </span>
            <h2 id="login-title" className="mt-5 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em]">
              Where should we <em className="font-serif font-normal italic text-primary">send it?</em>
            </h2>
            <p className="mt-2 text-[14.5px] leading-[1.5] text-muted">
              We only use this to deliver your pure herbal order. No password, nothing to remember.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
              <Field label="Full name" htmlFor="name">
                <input id="name" maxLength={80} className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
              </Field>
              <Field label="WhatsApp number" htmlFor="phone">
                <input id="phone" maxLength={18} className="field" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+91 98765 43210" />
              </Field>
              <Field label="Delivery address" htmlFor="address">
                <textarea id="address" maxLength={400} className="field resize-none" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="House, street, area, city, PIN" />
              </Field>

              <AnimatePresence initial={false}>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, transform: 'translateY(-4px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13.5px] text-danger"
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="press btn-primary mt-2 h-[50px] text-[16px] disabled:opacity-70">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save and continue'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="pl-1 text-[12.5px] font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}
