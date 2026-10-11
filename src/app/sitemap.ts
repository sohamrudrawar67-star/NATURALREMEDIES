import type { MetadataRoute } from 'next'
import { safeListProducts } from '@/lib/catalog'
import { absoluteUrl } from '@/lib/site'
import { productHref } from '@/store/useCartStore'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await safeListProducts()
  const latest = products.reduce<Date | undefined>((max, p) => {
    const d = p.updatedAt ? new Date(p.updatedAt) : undefined
    return d && (!max || d > max) ? d : max
  }, undefined)

  return [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/products'), lastModified: latest, changeFrequency: 'weekly', priority: 0.9 },
    ...products.map((p) => ({
      url: absoluteUrl(productHref(p)),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: p.image ? [absoluteUrl(p.image)] : undefined,
    })),
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
