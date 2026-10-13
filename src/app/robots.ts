import type { MetadataRoute } from 'next'
import { SITE_URL, absoluteUrl } from '@/lib/site'

// Private areas. Everything else (pages and product photos) is open to every crawler.
const disallow = ['/admin', '/api/', '/cart', '/profile', '/orders']
const allow = ['/', '/api/products/'] // product photos live under /api/products/…/image

/*
 * AI and answer-engine crawlers are welcomed by name. A crawler that matches a named
 * group ignores the "*" group, so each gets the same allow/disallow rules.
 */
const AI_AND_SEARCH_BOTS = [
  // OpenAI (ChatGPT search, browsing, training)
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic (Claude)
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google Gemini / AI Overviews, Apple Intelligence
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  // Microsoft Copilot / Bing, DuckDuckGo, Meta, Amazon, others
  'Bingbot',
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'Amazonbot',
  'MistralAI-User',
  'cohere-ai',
  'YouBot',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow, disallow },
      { userAgent: AI_AND_SEARCH_BOTS, allow, disallow },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
