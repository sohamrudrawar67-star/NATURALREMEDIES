import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { CartQuantityButton } from '@/components/CartQuantityButton'

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const product = MOCK_PRODUCTS.find((p) => p.id === resolvedParams.id)
  
  if (!product) {
    notFound()
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
