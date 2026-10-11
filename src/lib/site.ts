/** The shop's WhatsApp number (country code, no +). Orders and questions go here. */
export const STORE_WHATSAPP = '917721008644'
export const WHATSAPP_URL = `https://wa.me/${STORE_WHATSAPP}`

export const SITE_NAME = 'Natural Remedies'
export const SITE_TAGLINE = 'Good things, kept simple'
export const SITE_DESCRIPTION =
  'Natural Remedies is a small homegrown brand in India selling natural everyday goods like pure honey. Order in a minute on WhatsApp, with free delivery.'

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
