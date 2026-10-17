import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { breadcrumbLd, graph } from '@/lib/seo'
import { STORE_ADDRESS, WHATSAPP_URL, absoluteUrl, jsonLd } from '@/lib/site'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'Our story',
  description:
    'Natural Remedies is a small homegrown brand: a short list of natural everyday goods, clear prices and ordering that takes about a minute on WhatsApp.',
  alternates: { canonical: '/about' },
}

const aboutLd = graph(
  {
    '@type': 'AboutPage',
    url: absoluteUrl('/about'),
    name: 'Our story',
    about: { '@id': absoluteUrl('/#organization') },
  },
  breadcrumbLd([
    { name: 'Home', path: '/' },
    { name: 'Our story', path: '/about' },
  ])
)

export default function AboutPage() {
  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(aboutLd) }} />
      <section className="mx-auto max-w-[1040px] px-6 pt-36 sm:pt-44">
        <span className="enter inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tint text-tint-foreground text-[12px] font-medium border border-primary/20 mb-3 w-fit shadow-xs">
          🌿 Our Heritage & Philosophy
        </span>
        <h1
          className="enter mt-4 text-balance text-[clamp(44px,7.4vw,96px)] font-semibold leading-[0.95] tracking-[-0.05em]"
          style={{ animationDelay: '80ms' }}
        >
          Small on purpose. <em className="font-serif font-normal italic tracking-[-0.02em] text-primary">Homegrown</em> by
          choice.
        </h1>
      </section>

      <section className="mx-auto mt-20 grid max-w-[1040px] gap-12 px-6 md:grid-cols-[1fr_1.3fr] md:gap-20">
        <Reveal>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.14em] text-subtle">Who we are</h2>
        </Reveal>
        <Reveal delay={60}>
          <div className="space-y-6 text-[clamp(18px,1.8vw,22px)] leading-[1.55] tracking-[-0.01em]">
            <p>
              Natural Remedies is a small homegrown brand. No big warehouse, no team of hundreds — just a short list of
              natural, everyday things we&rsquo;re happy to put our name on.
            </p>
            <p className="text-muted">
              We keep it small so we can keep it simple: a handful of products, clear prices, and ordering that takes
              about a minute.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-28 max-w-[1040px] px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { k: 'A short shelf', v: 'Fewer things means each one gets proper attention, and choosing takes seconds.' },
            { k: 'A real conversation', v: 'Orders arrive on WhatsApp. You talk to us directly — no ticket numbers.' },
            { k: 'Nothing to sign up for', v: 'No passwords or accounts. Your details stay on your device until you send an order.' },
          ].map((item, i) => (
            <Reveal key={item.k} delay={i * 70}>
              <div className="h-full rounded-[28px] bg-surface p-7 ring-1 ring-primary/15 shadow-xs">
                <span className="font-serif text-[40px] italic leading-none text-primary">0{i + 1}</span>
                <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.025em]">{item.k}</h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-muted">{item.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-[1040px] px-6">
        <Reveal>
          <div className="rounded-[32px] border border-primary/20 bg-surface-2/60 p-8 sm:p-12 shadow-sm backdrop-blur-xs">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-[580px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1 text-[12px] font-semibold text-primary border border-primary/20">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Physical Store & Dispatch Center</span>
                </div>
                <h2 className="mt-4 text-[clamp(26px,3.5vw,38px)] font-semibold leading-[1.1] tracking-[-0.03em]">
                  Visit our shop in <em className="font-serif font-normal italic text-primary">Pune</em>
                </h2>
                <div className="mt-5 space-y-1 text-[15.5px] leading-relaxed text-foreground/90 font-medium">
                  <p className="text-[17px] font-bold text-primary">{STORE_ADDRESS.name}</p>
                  <p>{STORE_ADDRESS.building},</p>
                  <p>{STORE_ADDRESS.landmark},</p>
                  <p>{STORE_ADDRESS.locality}, {STORE_ADDRESS.city}, {STORE_ADDRESS.state}</p>
                </div>
                <p className="mt-4 text-[14px] text-muted">
                  Every order is packed and dispatched directly from our Pune location, maintaining the authentic quality of natural remedies and organic products.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col shrink-0 pt-2">
                <a
                  href={STORE_ADDRESS.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="press inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[14.5px] font-semibold text-primary-foreground shadow-xs hover:opacity-95"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="press inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary/25 bg-surface px-6 text-[14.5px] font-medium text-foreground hover:bg-surface-2"
                >
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-28 max-w-[1040px] px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-[#0d1609] px-8 py-14 text-[#f0f5ec] sm:px-14 sm:py-20 border border-primary/20 shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_30%,rgba(142,198,81,0.18),transparent)] pointer-events-none" />
            <h2 className="max-w-[18ch] text-balance text-[clamp(30px,4.2vw,54px)] font-semibold leading-[1.02] tracking-[-0.04em] relative z-10">
              Got a question? <em className="font-serif font-normal italic text-primary">Just ask.</em>
            </h2>
            <p className="mt-4 max-w-[40ch] text-[16px] leading-[1.55] opacity-75 relative z-10">
              About a product, an order, or anything else — send us a message on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 relative z-10">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex h-12 items-center rounded-full bg-white px-7 text-[15px] font-medium text-black hover:bg-white/90 active:scale-95 transition-transform"
              >
                Message us
              </a>
              <Link
                href="/products"
                className="press inline-flex h-12 items-center rounded-full border border-background/25 px-6 text-[15px] font-medium hover:bg-background/10"
              >
                Visit the shop
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
