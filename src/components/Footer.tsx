import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ExternalLink } from 'lucide-react'
import { STORE_ADDRESS, WHATSAPP_URL } from '@/lib/site'

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-primary/15 bg-surface-2/40">
      <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-primary/20 shadow-xs">
                <Image src="/logo.png" alt="" width={32} height={29} className="h-8 w-8 object-contain" />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em]">Natural Remedies</span>
            </div>
            <p className="mt-4 max-w-[34ch] text-[14px] leading-[1.55] text-muted">
              A small homegrown brand for everyday care. Questions about an order? Just message us on WhatsApp.
            </p>
          </div>
          <FooterCol
            title="Shop"
            links={[
              { href: '/products', label: 'All products' },
              { href: '/cart', label: 'Your basket' },
              { href: '/orders', label: 'Previous orders' },
            ]}
          />
          <FooterCol
            title="Us"
            links={[
              { href: '/about', label: 'Our story' },
              { href: WHATSAPP_URL, label: 'WhatsApp', external: true },
              { href: '/profile', label: 'Your details' },
            ]}
          />
          <div className="flex flex-col">
            <h2 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-subtle tracking-wide uppercase">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Store Location</span>
            </h2>
            <div className="mt-3 rounded-2xl bg-surface/80 p-4 ring-1 ring-primary/15 backdrop-blur-xs space-y-2">
              <p className="text-[13px] font-semibold text-foreground leading-snug">
                {STORE_ADDRESS.name}
              </p>
              <p className="text-[12.5px] leading-[1.5] text-muted">
                {STORE_ADDRESS.building},<br />
                {STORE_ADDRESS.landmark},<br />
                {STORE_ADDRESS.locality}, {STORE_ADDRESS.city}, {STORE_ADDRESS.state}
              </p>
              <a
                href={STORE_ADDRESS.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline pt-1"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          data-wordmark="Natural Remedies"
          className="pointer-events-none mt-16 select-none whitespace-nowrap text-center text-[clamp(56px,15.5vw,220px)] font-semibold leading-[0.8] tracking-[-0.06em] text-primary/[0.05] before:content-[attr(data-wordmark)]"
        />

        <div className="mt-8 flex flex-col justify-between gap-2 text-[12.5px] text-subtle sm:flex-row">
          <span>© {new Date().getFullYear()} Natural Remedies</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> A natural homegrown brand.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <h2 className="text-[12.5px] font-medium text-subtle">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noreferrer" className="text-[14px] text-foreground/80 hover:text-foreground">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[14px] text-foreground/80 hover:text-foreground">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
