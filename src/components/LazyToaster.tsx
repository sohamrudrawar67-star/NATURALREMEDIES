'use client'

import dynamic from 'next/dynamic'

// Toasts only appear after an action, so the toast library loads after the page is interactive
export const LazyToaster = dynamic(() => import('./AppToaster').then((m) => m.AppToaster), { ssr: false })
