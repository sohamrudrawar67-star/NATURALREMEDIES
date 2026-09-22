import { ProductCard } from '@/components/ProductCard'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { HeroGreeting } from '@/components/HeroGreeting'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="bg-secondary px-4 py-16 md:py-24">
        <div className="container mx-auto flex flex-col items-center text-center gap-6 max-w-3xl">
          <HeroGreeting />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground tracking-tight">
            Nature's Touch for Your Daily Care
          </h1>
          <p className="text-lg md:text-xl text-secondary-foreground/80 max-w-2xl">
            Discover our range of authentic, organic, and affordable herbal remedies made with pure ingredients for a healthier lifestyle.
          </p>
          <div className="flex gap-4 mt-4">
            <Link 
              href="/products" 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Shop Now
            </Link>
            <Link 
              href="/about" 
              className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-sm border border-border"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary">Featured Products</h2>
            <Link href="/products" className="text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
