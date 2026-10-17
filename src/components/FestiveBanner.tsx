'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FestivalConfig, FESTIVAL_THEMES } from '@/lib/festival'

interface FestiveBannerProps {
  config: FestivalConfig | null | undefined
}

export function FestiveBanner({ config }: FestiveBannerProps) {
  if (!config || !config.isEnabled) return null

  const theme = FESTIVAL_THEMES[config.festivalId] || FESTIVAL_THEMES.general
  const message = config.bannerMessage || theme.bannerNotice
  const emoji = theme.emoji

  return (
    <div className="relative overflow-hidden rounded-full border border-primary/25 bg-surface/90 px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-xs backdrop-blur-md transition-all enter">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: theme.gradientBg,
        }}
      />
      <Link
        href="/festival"
        className="group relative z-10 flex items-center justify-between gap-2 text-[12px] sm:text-[13px] font-medium text-foreground/90 hover:text-foreground"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-[13.5px] sm:text-[15px]">{emoji}</span>
          <span className="font-bold text-primary">{theme.hindiName}</span>
          <span className="hidden sm:inline text-subtle">•</span>
          <span className="truncate">{message}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10.5px] sm:text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <span>Festive Offers</span>
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </div>
  )
}
