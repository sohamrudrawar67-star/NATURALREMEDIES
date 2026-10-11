'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { authClient } from '@/lib/auth-client'

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  )
}

function AdminLogin() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const next = params.get('next')
  // Only ever bounce back inside /admin, never to an arbitrary URL
  const destination = next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin'

  // Already signed in? Skip the form.
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if ((data?.user as { role?: string } | undefined)?.role === 'admin') router.replace(destination)
    })
  }, [router, destination])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    const { error: signInError } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password })
    if (signInError) {
      setLoading(false)
      setPassword('')
      setError(
        signInError.status === 429
          ? 'Too many attempts. Wait a few minutes and try again.'
          : 'That email and password don’t match.'
      )
      return
    }
    router.replace(destination)
    router.refresh()
  }

  return (
    <div className="enter mx-auto flex min-h-[85svh] w-full max-w-sm flex-col justify-center px-6 pt-24">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-2">
        <Lock className="h-6 w-6 text-primary" strokeWidth={1.6} />
      </span>
      <h1 className="mt-6 text-center text-[32px] font-semibold tracking-[-0.04em]">Admin sign-in</h1>
      <p className="mt-2 text-center text-[15px] leading-[1.5] text-muted">For the people who run the shop.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="pl-1 text-[12.5px] font-medium text-muted">Email</span>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="pl-1 text-[12.5px] font-medium text-muted">Password</span>
          <span className="relative">
            <input
              type={show ? 'text' : 'password'}
              className="field pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              maxLength={128}
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="press absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-foreground"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              initial={{ opacity: 0, transform: 'translateY(-4px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[14px] text-danger"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} className="press btn-primary mt-2 h-12 text-[15px] disabled:opacity-70">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
