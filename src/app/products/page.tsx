import type { Metadata } from 'next'
import { ShopClient } from '@/components/shop/ShopClient'
import { safeListProducts } from '@/lib/catalog'
import { breadcrumbLd, graph, itemListLd } from '@/lib/seo'
import { SITE_NAME, jsonLd } from '@/lib/site'

type Props = { searchParams: Promise<{ q?: string | string[] }> }

const readQuery = (q: string | string[] | undefined) => (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 80) ?? ''

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = readQuery((await searchParams).q)
  if (query) {
    // Search result pages shouldn't compete with the real shop page in Google
    return { title: `Search: ${query}`, robots: { index: false, follow: true }, alternates: { canonical: '/products' } }
  }
  const products = await safeListProducts()
  const names = products.map((p) => p.name).join(', ')
  return {
    title: 'Shop natural products online',
    description: names
      ? `Shop ${SITE_NAME}: ${names}. Clear prices in ₹, free delivery, ordered in a minute on WhatsApp.`
      : `Shop ${SITE_NAME}. Clear prices in ₹, free delivery, ordered in a minute on WhatsApp.`,
    alternates: { canonical: '/products' },
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const query = readQuery((await searchParams).q)
  const products = await safeListProducts()

  return (
    <>
      {!query && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              graph(
                itemListLd(products, `${SITE_NAME} shop`),
                breadcrumbLd([
                  { name: 'Home', path: '/' },
                  { name: 'Shop', path: '/products' },
                ])
              )
            ),
          }}
        />
      )}
      <ShopClient products={products} query={query} />
    </>
  )
}
