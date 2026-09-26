'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, Search, User, X } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import { useState, useEffect } from 'react'
import { LoginModal } from '@/components/LoginModal'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  
  const cartItems = useCartStore((state) => state.items)
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useUserStore()
  
  // To prevent hydration errors with Zustand persist
  useEffect(() => {
    setMounted(true)
  }, [])

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-foreground hover:text-primary transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="font-bold text-xl text-primary tracking-tight">
              Natural Remedies
            </Link>
          </div>

          {/* Search Bar Overlay */}
          {isSearchOpen ? (
            <div className="absolute inset-y-0 left-0 right-0 bg-white flex items-center px-4 z-10">
              <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-2xl mx-auto gap-2">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground px-2 py-1"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            /* Desktop Navigation */
            <div className="hidden lg:flex items-center gap-8 font-medium">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About Us
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {mounted && user ? (
              <Link href="/profile" className="text-foreground hover:text-primary transition-colors hidden sm:flex items-center gap-2">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <button 
                onClick={openLoginModal}
                className="text-foreground hover:text-primary transition-colors hidden sm:flex items-center gap-2 font-medium"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}

            <Link href="/cart" className="relative text-foreground hover:text-primary transition-colors flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  )
}
