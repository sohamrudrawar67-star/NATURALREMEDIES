# SEO, AEO & GEO

How the site is set up to be found on Google, Bing, and in AI answers (ChatGPT, Claude, Perplexity, Gemini, Copilot).

## What's built in

| Area | What it does |
| --- | --- |
| **Server-rendered pages** | Every page's text, prices and FAQ are in the HTML itself. Most AI crawlers don't run JavaScript, so this is what lets them read the shop at all. Product pages are pre-built as static HTML. |
| **Readable URLs** | `/products/honey-500g` (old `/products/<id>` links permanently redirect). |
| **Metadata** | Unique title, description and canonical URL per page. Open Graph + Twitter cards. Search and basket pages are `noindex`. |
| **Share images** | A branded card for the site and one per product (photo, name, price), kept under WhatsApp's ~300KB preview limit. |
| **Structured data** (JSON-LD) | `Organization`/`OnlineStore`, `WebSite` with site search, `Product` with price/stock/free shipping, `BreadcrumbList`, `ItemList`, `FAQPage`. No invented ratings or reviews. |
| **FAQ** | Short, answer-first questions on the home page: the format AI assistants quote. Answers are generated from the live catalog. |
| **`/robots.txt`** | Open to all crawlers; AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Bingbot, …) are explicitly allowed. Private areas blocked. |
| **`/sitemap.xml`** | All pages and products with last-modified dates and product images. |
| **`/llms.txt`** | A plain-text summary for AI models: what the shop is, every product with price and stock, how to order, FAQ, contact. Updates automatically. |
| **Speed** | Images served as right-sized AVIF/WebP, no layout shift, light first download. |

Admin edits refresh all of the above immediately (pages, sitemap, `llms.txt`).

## Before launch (you)

1. **Set your real domain** on the host: `NEXT_PUBLIC_SITE_URL=https://your-domain` (canonical links, sitemap and structured data all use it).
2. **Google Search Console** → add the domain → verify (put the code in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, or use DNS) → *Sitemaps* → submit `https://your-domain/sitemap.xml`.
3. **Bing Webmaster Tools** → import from Search Console (or verify with `NEXT_PUBLIC_BING_SITE_VERIFICATION`). Bing's index also feeds ChatGPT search and Copilot.
4. **Google Business Profile** (if you have an address or service area): free, and the biggest lever for local searches.
5. Test a product page in Google's **Rich Results Test** and share a product link on WhatsApp to see the preview.

## What moves rankings after that

- **Real reviews.** If customers leave reviews (e.g. on Google Business Profile), they can later be shown on product pages and marked up. Never fake them.
- **Mentions and links** from other sites (local directories, Instagram bio, marketplaces, blogs).
- **More useful content**: e.g. a short page on how to store honey or how to tell pure honey apart, written by you.
- **Time**: new sites typically take weeks to months to rank.
