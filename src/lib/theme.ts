'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const getSnapshot = () => document.documentElement.classList.contains('dark')
const getServerSnapshot = () => false

export function useIsDark() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function setTheme(dark: boolean) {
  const root = document.documentElement
  // Flip colors in a single frame; animating every surface's color reads as lag.
  root.classList.add('theme-switching')
  root.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove('theme-switching'))
  })
}
