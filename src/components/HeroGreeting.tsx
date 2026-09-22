'use client'

import { useUserStore } from '@/store/useUserStore'
import { useEffect, useState } from 'react'

export function HeroGreeting() {
  const { user } = useUserStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return (
    <div className="inline-block bg-primary/10 text-primary px-6 py-2.5 rounded-full font-semibold text-lg md:text-xl mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      Welcome back, {user.name.split(' ')[0]}! 🌱
    </div>
  )
}
