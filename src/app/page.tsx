import type { Metadata } from 'next'
import { HomeClient } from '@/components/home/HomeClient'
import { Faq } from '@/components/home/Faq'
import { safeListProducts } from '@/lib/catalog'
import { faqLd, graph, itemListLd, shopFaqs } from '@/lib/seo'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, jsonLd } from '@/lib/site'

// Re-render at most every 5 minutes; admin edits purge it immediately.
export const revalidate = 300

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
      <HomeClient products={products} faq={<Faq faqs={faqs} />} />
    </>
  )
}
