'use client'

import { useEffect, useState } from 'react'

/**
 * Viewport size for scroll scenes, stable on phones: when the mobile address bar slides
 * in/out the browser fires `resize` with only the height changed. Re-laying out on that
 * makes pinned 3D scenes jump mid-scroll, so height-only changes are ignored.
 */
export function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800, ready: false })

  useEffect(() => {
    let lastW = -1
    const measure = () => {
      const w = window.innerWidth
      if (w === lastW) return
      lastW = w
      setVp({ w, h: window.innerHeight, ready: true })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return vp
}

/** Touch-first devices: scroll is already momentum-smoothed, so we don't add a spring on top. */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return coarse
}
