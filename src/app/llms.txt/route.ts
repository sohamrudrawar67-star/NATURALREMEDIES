import { safeListProducts } from '@/lib/catalog'
import { shopFaqs } from '@/lib/seo'
import { SITE_DESCRIPTION, SITE_NAME, STORE_WHATSAPP, WHATSAPP_URL, absoluteUrl } from '@/lib/site'
import { productHref } from '@/store/useCartStore'

/*
 * /llms.txt: a plain-language summary of the site for AI assistants (ChatGPT, Claude,
 * Perplexity, Gemini…), following the llms.txt convention. Generated from live data.
 */
export const revalidate = 3600

export async function GET() {
  const products = await safeListProducts()
  const faqs = shopFaqs(products)

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} is a small homegrown brand. Customers browse the website, add products to a basket, and send the order on WhatsApp; the shop confirms details directly. Prices are in Indian rupees (₹). Delivery is free. No account or password is needed.`,
    '',
    '## Products',
    '',
    ...(products.length
      ? products.map(
          (p) =>
            `- [${p.name}](${absoluteUrl(productHref(p))}): ₹${p.price}, ${p.isOutOfStock ? 'currently sold out' : 'in stock'}.${p.description ? ` ${p.description}` : ''}`
        )
      : ['- The product list is being updated. See the shop page.']),
    '',
    '## How to order',
    '',
    `1. Open the shop: ${absoluteUrl('/products')}`,
    '2. Add products to the basket.',
    '3. Enter name, WhatsApp number and delivery address (saved on the device, no sign-up).',
    `4. Tap "Send order on WhatsApp". The order message goes to +${STORE_WHATSAPP} and the shop confirms it.`,
    '',
    '## Frequently asked questions',
    '',
    ...faqs.flatMap((f) => [`### ${f.q}`, '', f.a, '']),
    '## Pages',
    '',
    `- [Home](${absoluteUrl('/')}): overview of the brand and products`,
    `- [Shop](${absoluteUrl('/products')}): all products with prices`,
    `- [Our story](${absoluteUrl('/about')}): about the brand`,
    '',
    '## Contact',
    '',
    `- WhatsApp: [+${STORE_WHATSAPP}](${WHATSAPP_URL})`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
