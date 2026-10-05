'use client'

import { getProductById } from '@/lib/products'
import { notFound } from 'next/navigation'
import { CartQuantityButton } from '@/components/CartQuantityButton'
import { Product } from '@/store/useCartStore'
import { use, useEffect, useState } from 'react'

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetched = await getProductById(resolvedParams.id)
        setProduct(fetched)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [resolvedParams.id])
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto items-start">
          <div className="w-full md:w-1/2 aspect-square bg-accent/50 rounded-3xl" />
          <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-10 gap-6">
            <div className="h-10 bg-accent/60 rounded-lg w-3/4" />
            <div className="h-8 bg-accent/60 rounded-lg w-1/4" />
            <div className="bg-accent/30 p-8 rounded-3xl mt-4 space-y-3">
              <div className="h-5 bg-accent/50 rounded-md w-1/3" />
              <div className="h-4 bg-accent/40 rounded-md w-full" />
              <div className="h-4 bg-accent/40 rounded-md w-full" />
              <div className="h-4 bg-accent/40 rounded-md w-2/3" />
            </div>
            <div className="mt-8 h-14 bg-accent/60 rounded-full w-48" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => window.history.back()} className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-20 max-w-6xl mx-auto items-start">
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative group">
          <div className="aspect-square bg-accent/30 rounded-[2rem] overflow-hidden relative shadow-sm border border-border/50">
             {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium">No image available</div>
              )}
              {product.isOutOfStock && (
                <div className="absolute top-6 left-6 bg-red-500/90 backdrop-blur-md text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg z-10 uppercase tracking-wide">
                  Out of Stock
                </div>
              )}
          </div>
        </div>
        
        {/* Details Section */}
        <div className="w-full md:w-1/2 flex flex-col pt-2 md:pt-8 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">₹{product.price}</p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-3 text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
              About this product
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground bg-accent/20 px-4 py-3 rounded-xl border border-accent/50 w-fit">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                100% Natural
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Authentic Quality
              </span>
            </div>
            
            <div className="mt-4">
               <CartQuantityButton product={product} large />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
