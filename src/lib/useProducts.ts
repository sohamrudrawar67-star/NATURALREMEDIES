'use client'

import { useEffect, useState } from 'react'
import { getProducts } from './products'
import { Product } from '@/store/useCartStore'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getProducts().then((p) => {
      if (!alive) return
      setProducts(p)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  return { products, loading }
}
