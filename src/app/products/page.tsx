import { ProductCard } from '@/components/ProductCard'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import Link from 'next/link'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const query = params.q?.toLowerCase()
  
  const filteredProducts = query 
    ? MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      )
    : MOCK_PRODUCTS

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          {query ? `Search Results for "${searchParams.q}"` : 'All Products'}
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl">
          {query 
            ? `Found ${filteredProducts.length} product(s) matching your search.` 
            : 'Browse our complete collection of natural and organic remedies for your daily needs.'}
        </p>
        {query && (
          <Link href="/products" className="inline-block mt-4 text-primary font-medium hover:underline">
            Clear Search
          </Link>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-accent rounded-3xl border border-border">
          <h2 className="text-2xl font-bold text-primary mb-2">No products found</h2>
          <p className="text-foreground/70 mb-6">We couldn't find any products matching your search.</p>
          <Link href="/products" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
            View All Products
          </Link>
        </div>
      )}
    </div>
  )
}
