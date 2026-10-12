import { Reveal } from '@/components/Reveal'

/**
 * Plain, visible Q&A. Native <details> so it works without JavaScript and every
 * answer is in the HTML for search engines and AI assistants to read.
 */
export function Faq({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto w-full max-w-[880px] px-6 py-[12vh]">
      <Reveal>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint/80 px-3 py-1 text-[12.5px] font-medium text-primary backdrop-blur-md mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Purity, Harvest & Delivery
        </div>
        <h2 id="faq-title" className="mt-2 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.04em]">
          Good to <em className="font-serif font-normal italic text-primary">know.</em>
        </h2>
      </Reveal>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {faqs.map((f, i) => (
          <details key={f.q} className="group py-1" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] font-medium tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
              <h3 className="group-hover:text-primary transition-colors">{f.q}</h3>
              <span
                aria-hidden
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 group-open:bg-tint text-[18px] leading-none text-muted group-open:text-primary transition-all duration-200 ease-[var(--ease-out)] group-open:rotate-45 border border-primary/10 group-open:border-primary/25"
              >
                +
              </span>
            </summary>
            <p className="max-w-[62ch] pb-6 pr-12 text-[16px] leading-[1.6] text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
