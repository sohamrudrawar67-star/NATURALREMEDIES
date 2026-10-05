'use client'

import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { HeroGreeting } from '@/components/HeroGreeting'
import { getProducts } from '@/lib/products'
import { Product } from '@/store/useCartStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetched = await getProducts()
        setProducts(fetched.slice(0, 4)) // Show up to 4 featured products
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-secondary/50 to-white px-4 py-20 md:py-32 overflow-hidden">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto flex flex-col items-center text-center gap-6 max-w-3xl animate-fade-in-up">
          <HeroGreeting />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Natural Choices for <span className="text-primary">Everyday Wellness</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed mt-2">
            Discover our range of authentic, organic, and affordable herbal remedies crafted with pure ingredients for a healthier lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <Link 
              href="/products" 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-lg"
            >
              Explore Products
            </Link>
            <Link 
              href="/about" 
              className="bg-white text-foreground px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm border border-border w-full sm:w-auto text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-20 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground mt-2 font-medium">Handpicked remedies just for you.</p>
            </div>
            <Link href="/products" className="text-primary font-bold hover:text-primary/80 hover:underline underline-offset-4 transition-all group flex items-center gap-1">
              View All 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              // Products
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
