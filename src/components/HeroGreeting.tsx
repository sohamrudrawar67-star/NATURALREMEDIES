'use client'

import { useUserStore } from '@/store/useUserStore'
import { useHydrated } from '@/lib/useHydrated'

/** "Welcome back, Priya" for returning customers; the brand line for everyone else. */
export function HeroGreeting({ fallback }: { fallback: string }) {
  const user = useUserStore((s) => s.user)
  const hydrated = useHydrated()
  if (!hydrated || !user) return <>{fallback}</>
  return <>Welcome back, {user.name.trim().split(' ')[0]}</>
}
