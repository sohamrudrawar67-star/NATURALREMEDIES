'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, Search, User, X } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import { useState, useEffect } from 'react'
import { LoginModal } from '@/components/LoginModal'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/lib/products'
import { Product } from '@/store/useCartStore'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
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

  const handleOpenSearch = async () => {
    setIsSearchOpen(true)
    if (allProducts.length === 0) {
      setIsSearching(true)
      const fetched = await getProducts()
      setAllProducts(fetched)
      setIsSearching(false)
    }
  }

  const matchedProducts = searchQuery.trim() 
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) 
    : []

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
              <img src="/logo.png" alt="Natural Remedies Logo" className="w-10 h-10 object-contain" />
              Natural Remedies
            </Link>
          </div>

          {/* Search Bar Overlay */}
          {isSearchOpen ? (
            <div className="absolute top-0 left-0 right-0 bg-white flex flex-col z-20 shadow-md border-b border-border">
              <div className="h-16 px-4 flex items-center">
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
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Live Search Results */}
              {searchQuery.trim().length > 0 && (
                <div className="w-full max-w-2xl mx-auto px-4 pb-4 max-h-[60vh] overflow-y-auto">
                  {isSearching ? (
                    <div className="text-center py-4 text-muted-foreground">Searching...</div>
                  ) : matchedProducts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {matchedProducts.map(product => (
                        <Link 
                          key={product.id} 
                          href={`/products/${product.id}`}
                          onClick={() => {
                            setIsSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="flex items-center gap-4 p-2 hover:bg-accent rounded-xl transition-colors"
                        >
                          <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">No img</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary">{product.name}</h4>
                            <p className="text-sm font-bold">₹{product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No products found for "{searchQuery}"</div>
                  )}
                </div>
              )}
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
              {mounted && user?.isAdmin && (
                <Link href="/admin" className="text-red-500 hover:text-red-600 transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={handleOpenSearch}
              className="text-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {mounted && user ? (
              <Link href="/profile" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <button 
                onClick={openLoginModal}
                className="text-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-border shadow-lg p-4 flex flex-col">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary font-medium py-3 border-b border-border/50">
              Home
            </Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary font-medium py-3 border-b border-border/50">
              Products
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary font-medium py-3 border-b border-border/50">
              About Us
            </Link>
            {mounted && user?.isAdmin && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-red-500 hover:text-red-600 font-medium py-3">
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  )
}
