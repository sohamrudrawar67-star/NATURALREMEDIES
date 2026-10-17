import type { Product } from '@/store/useCartStore'
import { productHref } from '@/store/useCartStore'
import { SITE_DESCRIPTION, SITE_NAME, STORE_ADDRESS, STORE_WHATSAPP, WHATSAPP_URL, absoluteUrl } from './site'

/*
 * Structured data (schema.org JSON-LD). Search engines and AI assistants read this to
 * understand the shop. Everything here must match what the page visibly says —
 * no invented ratings, reviews or claims.
 */

const ORG_ID = absoluteUrl('/#organization')
const SITE_ID = absoluteUrl('/#website')

export function organizationLd() {
  return {
    '@type': ['Organization', 'OnlineStore'],
    '@id': ORG_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png'), width: 780, height: 710 },
    image: absoluteUrl('/opengraph-image'),
    description: SITE_DESCRIPTION,
    areaServed: { '@type': 'Country', name: 'India' },
    currenciesAccepted: 'INR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${STORE_ADDRESS.building}, ${STORE_ADDRESS.landmark}`,
      addressLocality: `${STORE_ADDRESS.locality}, ${STORE_ADDRESS.city}`,
      addressRegion: STORE_ADDRESS.state,
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${STORE_WHATSAPP}`,
      url: WHATSAPP_URL,
      availableLanguage: ['English'],
    },
    sameAs: [WHATSAPP_URL],
  }
}

export function websiteLd() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    inLanguage: 'en-IN',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/products?q={search_term_string}') },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function productLd(p: Product) {
  const url = absoluteUrl(productHref(p))
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.name,
    url,
    sku: p.id,
    description: p.description || `${p.name} from ${SITE_NAME}.`,
    image: p.image ? [absoluteUrl(p.image)] : undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      price: p.price.toFixed(2),
      priceCurrency: 'INR',
      availability: p.isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': ORG_ID },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'INR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
      },
    },
  }
}

export function itemListLd(products: Product[], name: string) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(productHref(p)),
      name: p.name,
    })),
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** Wraps nodes in a single @graph document. */
export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes })

/** Short, answer-first FAQ. Plain sentences so assistants can quote them directly. */
export function shopFaqs(products: Product[]) {
  const list = products
    .filter((p) => !p.isOutOfStock)
    .map((p) => `${p.name} for ₹${p.price}`)
    .join(', ')
  return [
    {
      q: `What does ${SITE_NAME} sell?`,
      a: list
        ? `${SITE_NAME} is a small homegrown brand selling natural everyday goods. Right now the shop has ${list}.`
        : `${SITE_NAME} is a small homegrown brand selling natural everyday goods.`,
    },
    {
      q: `How do I order from ${SITE_NAME}?`,
      a: 'Add products to your basket, enter your name, WhatsApp number and delivery address once, then tap “Send order on WhatsApp”. Your order is written out for you; send the message and the shop confirms the details with you directly on WhatsApp.',
    },
    {
      q: 'Is delivery free?',
      a: 'Yes. No delivery charge is added to your order at checkout.',
    },
    {
      q: 'Do I need to create an account?',
      a: 'No. There is no sign-up and no password. You only enter your name, WhatsApp number and delivery address, and they stay saved on your device for next time.',
    },
    {
      q: `How can I contact ${SITE_NAME}?`,
      a: `Message the shop on WhatsApp at +${STORE_WHATSAPP.slice(0, 2)} ${STORE_WHATSAPP.slice(2, 7)} ${STORE_WHATSAPP.slice(7)} for questions about products or orders.`,
    },
  ]
}
