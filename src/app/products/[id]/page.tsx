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
      const fetched = await getProductById(resolvedParams.id)
      setProduct(fetched)
      setLoading(false)
    }
    fetchProduct()
  }, [resolvedParams.id])
  
  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading product...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-16 text-center">Product not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row gap-12 max-w-5xl mx-auto">
        <div className="w-full md:w-1/2 aspect-square bg-accent rounded-3xl overflow-hidden relative">
           {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
            {product.isOutOfStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10">
                Out of Stock
              </div>
            )}
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
          <h1 className="text-4xl font-bold text-primary">{product.name}</h1>
          <p className="text-2xl font-semibold text-foreground">₹{product.price}</p>
          
          <div className="bg-secondary/50 p-6 rounded-2xl">
            <h3 className="font-semibold text-lg mb-2 text-secondary-foreground">Product Description</h3>
            <p className="text-secondary-foreground/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-4 flex">
             <CartQuantityButton product={product} large />
          </div>
        </div>
      </div>
    </div>
  )
}
