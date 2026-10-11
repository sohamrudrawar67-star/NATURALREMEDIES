'use client'

import { Toaster } from 'sonner'
import { useIsDark } from '@/lib/theme'

export function AppToaster() {
  const dark = useIsDark()
  return (
    <Toaster
      position="bottom-center"
      theme={dark ? 'dark' : 'light'}
      toastOptions={{
        style: {
          borderRadius: 16,
          background: 'var(--glass-strong)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid var(--glass-line)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-geist-sans)',
        },
      }}
    />
  )
}
