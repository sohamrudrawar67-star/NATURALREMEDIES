import { Product } from '@/store/useCartStore'

// One in-flight request shared by every component that asks for the catalog
// (hero, shelf, navbar search) so a page load hits the API once.
let catalogPromise: Promise<Product[]> | null = null

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export const getProducts = async (options?: { fresh?: boolean }): Promise<Product[]> => {
  if (options?.fresh || !catalogPromise) {
    catalogPromise = fetchProducts()
  }
  const products = await catalogPromise
  if (products.length === 0) catalogPromise = null
  return products
}
