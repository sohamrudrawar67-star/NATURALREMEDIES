'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search, ShoppingBag, User, X, Moon, Sun, ArrowRight } from 'lucide-react'
import { useCartStore, productHref } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import dynamic from 'next/dynamic'

// Loaded only when someone opens it, so it isn't in every page's first download
const LoginModal = dynamic(() => import('@/components/LoginModal').then((m) => m.LoginModal), { ssr: false })
import { getProducts } from '@/lib/products'
import { Product } from '@/store/useCartStore'
import { useHydrated } from '@/lib/useHydrated'
import { setTheme, useIsDark } from '@/lib/theme'
import { cn } from '@/lib/utils'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/about', label: 'Our story' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const hydrated = useHydrated()
  const reduceMotion = useReducedMotion()
  const isDark = useIsDark()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useUserStore()
  // Keep the modal mounted after first open so its exit animation can play
  const [loginMounted, setLoginMounted] = useState(false)
  if (isLoginModalOpen && !loginMounted) setLoginMounted(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close overlays on navigation (adjusting state during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery('')
  }

  const openSearch = async () => {
    setMenuOpen(false)
    setSearchOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
    if (allProducts.length === 0) setAllProducts(await getProducts())
  }

  // "/" opens search, Esc closes. Keyboard-triggered, so no animation on these paths.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (e.key === '/' && !typing) {
        e.preventDefault()
        openSearch()
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  const matches = query.trim()
    ? allProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 5)
    : []

  const links = LINKS
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const panelOpen = searchOpen || menuOpen

  return (
    <>
      {/* Click-away scrim for the search / menu panels */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setSearchOpen(false)
              setMenuOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4 pointer-events-none">
        <div className="w-full max-w-[1040px] pointer-events-auto">
          <nav
            className={cn(
              'relative flex h-14 items-center justify-between rounded-[20px] pl-2.5 pr-2 transition-[background-color,box-shadow] duration-300',
              scrolled || panelOpen ? 'glass-strong' : 'glass'
            )}
            aria-label="Main"
          >
            <Link href="/" className="press flex items-center gap-2.5 rounded-full pr-2" aria-label="Natural Remedies home">
              <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5">
                <Image src="/logo.png" alt="" width={32} height={29} className="h-8 w-8 object-contain" preload />
              </span>
              <span className="whitespace-nowrap text-[15px] font-semibold tracking-[-0.02em]">Natural Remedies</span>
            </Link>

            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'press relative rounded-full px-4 py-1.5 text-[13.5px] font-medium tracking-[-0.01em]',
                    isActive(link.href) ? 'text-foreground' : 'text-muted hover:text-foreground'
                  )}
                >
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.07] dark:bg-white/[0.1]"
                      transition={reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.15 }}
                    />
                  )}
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-0.5">
              <IconButton label="Search (press /)" onClick={() => (searchOpen ? setSearchOpen(false) : openSearch())}>
                <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </IconButton>

              <IconButton className="hidden md:grid" label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme(!isDark)}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={hydrated && isDark ? 'moon' : 'sun'}
                    initial={{ opacity: 0, scale: 0.6, filter: 'blur(4px)', rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6, filter: 'blur(4px)', rotate: 45 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="grid place-items-center"
                  >
                    {hydrated && isDark ? (
                      <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    ) : (
                      <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </IconButton>

              {hydrated && user ? (
                <IconLink href="/profile" label="Your profile">
                  <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                </IconLink>
              ) : (
                <IconButton label="Log in" onClick={openLoginModal}>
                  <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </IconButton>
              )}

              <IconLink href="/cart" label={`Basket, ${cartCount} items`}>
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <AnimatePresence initial={false}>
                  {hydrated && cartCount > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                      className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center overflow-hidden rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground"
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={cartCount}
                          initial={{ transform: 'translateY(100%)', opacity: 0 }}
                          animate={{ transform: 'translateY(0%)', opacity: 1 }}
                          exit={{ transform: 'translateY(-100%)', opacity: 0 }}
                          transition={{ duration: 0.2, ease: EASE_OUT }}
                        >
                          {cartCount}
                        </motion.span>
                      </AnimatePresence>
                    </motion.span>
                  )}
                </AnimatePresence>
              </IconLink>

              <button
                className="press ml-0.5 grid h-10 w-10 place-items-center rounded-full md:hidden"
                onClick={() => {
                  setSearchOpen(false)
                  setMenuOpen((v) => !v)
                }}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <span className="relative block h-3 w-[18px]">
                  <span
                    className={cn(
                      'absolute left-0 top-0 h-[1.5px] w-full rounded bg-foreground transition-transform duration-300 ease-[var(--ease-out)]',
                      menuOpen && 'translate-y-[5px] rotate-45'
                    )}
                  />
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 h-[1.5px] w-full rounded bg-foreground transition-transform duration-300 ease-[var(--ease-out)]',
                      menuOpen && '-translate-y-[5px] -rotate-45'
                    )}
                  />
                </span>
              </button>
            </div>
          </nav>

          {/* Search panel — grows from the navbar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                key="search"
                initial={{ opacity: 0, transform: 'translateY(-6px) scale(0.98)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                exit={{ opacity: 0, transform: 'translateY(-6px) scale(0.98)', transition: { duration: 0.15 } }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                style={{ transformOrigin: 'top center' }}
                className="glass-strong mt-2 overflow-hidden rounded-[20px]"
              >
                <form onSubmit={submitSearch} className="flex items-center gap-3 px-5 py-4">
                  <Search className="h-5 w-5 text-muted" strokeWidth={1.75} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search soap, oil, shampoo…"
                    className="flex-1 bg-transparent text-[17px] tracking-[-0.01em] outline-none placeholder:text-subtle"
                    aria-label="Search products"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="press grid h-8 w-8 place-items-center rounded-full text-muted hover:text-foreground" aria-label="Close search">
                    <X className="h-4 w-4" />
                  </button>
                </form>
                {query.trim() && (
                  <div className="border-t border-line px-2 py-2">
                    {matches.length > 0 ? (
                      matches.map((p) => (
                        <Link
                          key={p.id}
                          href={productHref(p)}
                          className="press flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-foreground/[0.04]"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                            {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}
                          </span>
                          <span className="flex-1 text-[15px] font-medium">{p.name}</span>
                          <span className="text-[14px] tabular-nums text-muted">₹{p.price}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-[14px] text-muted">Nothing called “{query.trim()}” yet.</p>
                    )}
                  </div>
                )}
                {!query.trim() && (
                  <div className="border-t border-line px-5 py-3 text-[13px] text-subtle">
                    Tip: press <kbd className="rounded-md border border-line-strong px-1.5 py-0.5 font-mono text-[11px]">/</kbd> anywhere to search.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, transform: 'translateY(-6px) scale(0.98)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                exit={{ opacity: 0, transform: 'translateY(-6px) scale(0.98)', transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                style={{ transformOrigin: 'top right' }}
                className="glass-strong mt-2 rounded-[20px] p-3 md:hidden"
              >
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, transform: 'translateY(6px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.3, delay: 0.04 + i * 0.035, ease: EASE_OUT }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'press flex items-center justify-between rounded-2xl px-4 py-3.5 text-[22px] font-medium tracking-[-0.02em]',
                        isActive(link.href) ? 'bg-foreground/[0.05]' : ''
                      )}
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 text-subtle" />
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, transform: 'translateY(6px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={{ duration: 0.3, delay: 0.04 + links.length * 0.035, ease: EASE_OUT }}
                  onClick={() => setTheme(!isDark)}
                  className="press mt-1 flex w-full items-center justify-between rounded-2xl border-t border-line px-4 py-3.5 text-[15px] text-muted"
                >
                  {isDark ? 'Light mode' : 'Dark mode'}
                  {isDark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {loginMounted && <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />}
    </>
  )
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'press relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 hover:bg-foreground/[0.06] hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="press relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 hover:bg-foreground/[0.06] hover:text-foreground"
    >
      {children}
    </Link>
  )
}
