export type FestivalId = 'diwali' | 'holi' | 'navratri' | 'sankranti' | 'general'

export interface FestivalTheme {
  id: FestivalId
  name: string
  hindiName: string
  emoji: string
  defaultTitle: string
  defaultSubtitle: string
  badgeText: string
  bannerNotice: string
  accentColor: string
  tagColor: string
  gradientBg: string
  borderAccent: string
  motifs: string[]
}

export const FESTIVAL_THEMES: Record<FestivalId, FestivalTheme> = {
  diwali: {
    id: 'diwali',
    name: 'Diwali (Deepotsav)',
    hindiName: 'शुभ दीपावली',
    emoji: '🪔',
    defaultTitle: 'Diwali Deepotsav Specials',
    defaultSubtitle:
      'Illuminate your festive season with pure, authentic Ayurvedic care, raw honey, and wholesome gift hampers for loved ones.',
    badgeText: 'Diwali Deepotsav • Special Discounts',
    bannerNotice: '🪔 Shubh Diwali! Exclusive festive discounts on authentic herbal care & hampers. Explore now →',
    accentColor: '#d97706',
    tagColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    gradientBg:
      'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.08) 50%, transparent 80%)',
    borderAccent: 'border-amber-500/40 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]',
    motifs: ['🪔', '✨', '🪔', '✨'],
  },
  holi: {
    id: 'holi',
    name: 'Holi (Festival of Colors)',
    hindiName: 'रंगोत्सव होली',
    emoji: '🎨',
    defaultTitle: 'Organic Holi & Skin Care Specials',
    defaultSubtitle:
      'Celebrate a vibrant and safe Holi with 100% pure herbal cosmetics, skin-nourishing remedies, and organic wellness treats.',
    badgeText: 'Holi Herbal Care • Special Discounts',
    bannerNotice: '🎨 Happy Holi! Nourish and celebrate with pure organic herbal specials. Shop offers →',
    accentColor: '#db2777',
    tagColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    gradientBg:
      'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(244, 63, 94, 0.18), rgba(16, 185, 129, 0.12) 50%, transparent 80%)',
    borderAccent: 'border-rose-500/40 shadow-[0_0_30px_-5px_rgba(244,63,94,0.2)]',
    motifs: ['🎨', '🌸', '🌿', '✨'],
  },
  navratri: {
    id: 'navratri',
    name: 'Navratri & Dussehra',
    hindiName: 'शुभ नवरात्रि',
    emoji: '🌸',
    defaultTitle: 'Navratri & Dussehra Auspicious Offers',
    defaultSubtitle:
      'Nine days of devotion and renewal. Nourish your body with sattvic natural remedies, raw forest honey, and authentic herbs.',
    badgeText: 'Navratri Shubh Utsav • Festive Savings',
    bannerNotice: '🌸 Shubh Navratri! Handcrafted pure remedies for festive vitality & wellness. View discounts →',
    accentColor: '#ea580c',
    tagColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    gradientBg:
      'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(234, 88, 12, 0.20), rgba(245, 158, 11, 0.10) 50%, transparent 80%)',
    borderAccent: 'border-orange-500/40 shadow-[0_0_30px_-5px_rgba(234,88,12,0.2)]',
    motifs: ['🌸', '🪔', '🌿', '✨'],
  },
  sankranti: {
    id: 'sankranti',
    name: 'Makar Sankranti & Harvest',
    hindiName: 'मकर संक्रांति',
    emoji: '🌾',
    defaultTitle: 'Makar Sankranti & Harvest Delights',
    defaultSubtitle:
      'Tilgul ghya, god god bola! Pure natural honey, warm winter herbal medicines, and seasonal organic goodness.',
    badgeText: 'Harvest & Sankranti • Special Savings',
    bannerNotice: '🌾 Happy Makar Sankranti! Fresh harvest honey & herbal wellness. Explore festive offers →',
    accentColor: '#ca8a04',
    tagColor: 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-500/30',
    gradientBg:
      'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(202, 138, 4, 0.20), rgba(34, 197, 94, 0.08) 50%, transparent 80%)',
    borderAccent: 'border-yellow-500/40 shadow-[0_0_30px_-5px_rgba(202,138,4,0.2)]',
    motifs: ['🌾', '🍯', '☀️', '✨'],
  },
  general: {
    id: 'general',
    name: 'General Festive Celebration',
    hindiName: 'उत्सव विशेष',
    emoji: '✨',
    defaultTitle: 'Festive Season Celebration Specials',
    defaultSubtitle:
      'Special discounted treats and curated herbal hampers from our shelf for the celebration season.',
    badgeText: 'Festive Special • Limited Time Discounts',
    bannerNotice: '✨ Festive celebration specials live! Enjoy exclusive discounts on natural care. Tap to shop →',
    accentColor: '#16a34a',
    tagColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    gradientBg:
      'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34, 197, 94, 0.18), rgba(245, 158, 11, 0.10) 50%, transparent 80%)',
    borderAccent: 'border-emerald-500/40 shadow-[0_0_30px_-5px_rgba(34,197,94,0.2)]',
    motifs: ['✨', '🌿', '🍯', '✨'],
  },
}

export interface FestivalConfig {
  isEnabled: boolean
  festivalId: FestivalId
  customTitle?: string
  customSubtitle?: string
  discountBadgeText?: string
  bannerMessage?: string
}

export const DEFAULT_FESTIVAL_CONFIG: FestivalConfig = {
  isEnabled: false,
  festivalId: 'diwali',
  customTitle: '',
  customSubtitle: '',
  discountBadgeText: '',
  bannerMessage: '',
}
