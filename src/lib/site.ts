/** The shop's WhatsApp number (country code, no +). Orders and questions go here. */
export const STORE_WHATSAPP = '918080543277'
export const WHATSAPP_URL = `https://wa.me/${STORE_WHATSAPP}`

export const SITE_NAME = 'Natural Remedies'
export const SITE_TAGLINE = 'Good things, kept simple'
export const SITE_DESCRIPTION =
  'Natural Remedies is a small homegrown brand in India selling natural everyday goods like pure honey. Order in a minute on WhatsApp, with free delivery.'

export const STORE_ADDRESS = {
  name: 'NATURAL REMEDIES AND ORGANIC PRODUCTS STORE',
  building: 'Amey Co-operative Housing society, Flat No. 10 4th floor',
  landmark: 'Above Hotel MH 12, NDA Pashan Rd',
  locality: 'Bavdhan',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
  full: 'NATURAL REMEDIES AND ORGANIC PRODUCTS STORE, Amey Co-operative Housing society, Flat No. 10 4th floor, Above Hotel MH 12, NDA Pashan Rd, Bavdhan, Pune, Maharashtra',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('NATURAL REMEDIES AND ORGANIC PRODUCTS STORE, Amey Co-operative Housing society, Above Hotel MH 12, NDA Pashan Rd, Bavdhan, Pune, Maharashtra'),
}

/**
 * Public site URL, used for canonical links, the sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL to your real domain in production (e.g. https://naturalremedies.in).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(
  /\/+$/,
  ''
)

export const absoluteUrl = (path = '/') => new URL(path, SITE_URL).toString()

/** Serializes JSON-LD safely for a <script> tag (no "</script>" breakouts). */
const LT_ESCAPE = String.fromCharCode(92) + 'u003c' // backslash + u003c: JSON's escape for '<'
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, LT_ESCAPE)
