import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'
import { findProduct, safeListProducts } from '@/lib/catalog'
import { breadcrumbLd, graph, productLd } from '@/lib/seo'
import { SITE_NAME, jsonLd } from '@/lib/site'
import { productHref } from '@/store/useCartStore'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

// Pre-render every product at build time (new ones render on first visit)
export async function generateStaticParams() {
  const products = await safeListProducts()
  return products.filter((p) => p.slug).map((p) => ({ slug: p.slug! }))
}

async function load(slug: string) {
  try {
    return await findProduct(slug)
  } catch (error) {
    console.error('[product page]', error instanceof Error ? error.message : error)
    return null
  }
}

function describe(p: NonNullable<Awaited<ReturnType<typeof load>>>) {
  const base = p.description?.trim() || `${p.name} from ${SITE_NAME}.`
  const tail = p.isOutOfStock ? 'Currently sold out.' : `₹${p.price}, free delivery, order on WhatsApp.`
  const text = `${base} ${tail}`
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await load((await params).slug)
  if (!product) return { title: 'Product not found', robots: { index: false } }
  const path = productHref(product)
  return {
    title: `${product.name} — ₹${product.price}`,
    description: describe(product),
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, title: `${product.name} — ₹${product.price} | ${SITE_NAME}`, description: describe(product) },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'INR',
      'product:availability': product.isOutOfStock ? 'out of stock' : 'in stock',
      'product:brand': SITE_NAME,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await load(slug)
  if (!product) notFound()
  // Old links used the database id; send them (and their ranking) to the readable URL
  if (product.slug && slug !== product.slug) permanentRedirect(productHref(product))

  const others = (await safeListProducts()).filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            graph(
              productLd(product),
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/products' },
                { name: product.name, path: productHref(product) },
              ])
            )
          ),
        }}
      />
      <ProductDetail product={product} others={others} />
    </>
  )
}
