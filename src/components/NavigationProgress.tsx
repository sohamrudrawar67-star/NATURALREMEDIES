'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [navigating, setNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // When pathname or searchParams change, finish and hide progress bar
  useEffect(() => {
    if (navigating) {
      setProgress(100)
      const t = setTimeout(() => {
        setNavigating(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [pathname, searchParams])

  // Listen to document clicks on internal links to start progress immediately (0ms feedback)
  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external links, anchor fragments, new tabs, downloads
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        target.hasAttribute('download')
      ) {
        return
      }

      // Check if it's the exact same page URL
      const currentUrl = window.location.pathname + window.location.search
      if (href === currentUrl) return

      // Trigger instant navigation feedback
      setNavigating(true)
      setProgress(25)

      // Increment progress gradually while route resolves
      timer = setTimeout(() => {
        setProgress((prev) => (prev < 80 ? prev + 45 : prev))
      }, 120)
    }

    document.addEventListener('click', handleClick, { capture: true, passive: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      clearTimeout(timer)
    }
  }, [])

  if (!navigating && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[99999] h-[2.5px] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-[#789650] to-primary transition-all duration-200 ease-out shadow-[0_0_8px_rgba(74,116,36,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  )
}
