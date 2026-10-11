import type { Metadata } from 'next'
import { HomeClient } from '@/components/home/HomeClient'
import { Faq } from '@/components/home/Faq'
import { safeListProducts } from '@/lib/catalog'
import { faqLd, graph, itemListLd, shopFaqs } from '@/lib/seo'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, jsonLd } from '@/lib/site'

// Always serve fresh catalog so admin published products reflect immediately.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE} | Pure honey, ordered on WhatsApp` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

export default async function Home() {
  const products = await safeListProducts()
  const faqs = shopFaqs(products)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(graph(itemListLd(products, `${SITE_NAME} products`), faqLd(faqs))) }}
      />
      <HomeClient products={products} faqs={faqs} faq={<Faq faqs={faqs} />} />
    </>
  )
}
