import { Reveal } from '@/components/Reveal'
import { Product } from '@/store/useCartStore'
import { ShoppingBag, MapPin, Check } from 'lucide-react'

export function HowToOrder({ products }: { products: Product[] }) {
  // The example order uses whatever is actually on the shelf (blank until the catalog loads)
  const [a, b] = products
  const lines = a ? [{ p: a, q: 2 }, ...(b ? [{ p: b, q: 1 }] : [])] : []
  const total = lines.reduce((sum, l) => sum + l.p.price * l.q, 0)

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[14vh]">
      <Reveal>
        <p className="text-[14px] font-medium text-primary">Ordering</p>
        <h2 className="mt-3 max-w-[16ch] text-balance text-[clamp(32px,4.6vw,60px)] font-semibold leading-[1.02] tracking-[-0.04em]">
          No checkout maze. <span className="text-muted">Just a message.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]">
        {/* Step 1 */}
        <Reveal className="md:col-span-3" delay={0}>
          <div className="relative h-full overflow-hidden rounded-[30px] bg-surface p-8 ring-1 ring-line">
            <StepNumber n={1} />
            <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.025em]">Fill your basket</h3>
            <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.55] text-muted">
              Add what you need. Your basket stays saved on this device, so you can come back to it later.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="glass flex items-center gap-3 rounded-2xl py-2 pl-2 pr-4">
                {a?.image ? (
                  <img src={a.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <span className="skeleton h-11 w-11 rounded-xl" />
                )}
                <div className="min-w-[96px] text-[13px] leading-tight">
                  {a ? (
                    <>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-muted tabular-nums">2 × ₹{a.price}</div>
                    </>
                  ) : (
                    <>
                      <div className="skeleton h-3 w-20 rounded" />
                      <div className="skeleton mt-1.5 h-3 w-12 rounded" />
                    </>
                  )}
                </div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Step 2 */}
        <Reveal className="md:col-span-3" delay={80}>
          <div className="relative h-full overflow-hidden rounded-[30px] bg-surface p-8 ring-1 ring-line">
            <StepNumber n={2} />
            <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.025em]">Tell us where</h3>
            <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.55] text-muted">
              Your name, WhatsApp number and address. That&rsquo;s it — no passwords, no account to remember.
            </p>
            <div className="mt-8 max-w-[300px] space-y-2">
              <FakeField label="Name" value="Priya S." />
              <FakeField label="Address" value="Flat 4B, near the bakery…" icon />
            </div>
          </div>
        </Reveal>

        {/* Step 3 — wide */}
        <Reveal className="md:col-span-6" delay={120}>
          <div className="relative overflow-hidden rounded-[30px] bg-[#e7efe0] p-8 ring-1 ring-line dark:bg-[#0f160b] md:p-10">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <StepNumber n={3} />
                <h3 className="mt-6 text-[clamp(24px,2.6vw,34px)] font-semibold leading-[1.1] tracking-[-0.03em]">
                  Send it on WhatsApp.
                  <br />
                  <span className="font-serif font-normal italic">We take it from there.</span>
                </h3>
                <p className="mt-3 max-w-[38ch] text-[15px] leading-[1.55] text-muted">
                  Checkout opens WhatsApp with your order already written out. Hit send, and we&rsquo;ll confirm the details with you directly.
                </p>
              </div>

              {/* A little chat, the way it actually looks */}
              <div className="relative mx-auto w-full max-w-[380px]">
                <div className="glass rounded-[26px] p-4">
                  <div className="flex items-center gap-2.5 border-b border-line pb-3">
                    <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5">
                      <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13.5px] font-semibold">Natural Remedies</div>
                      <div className="text-[11.5px] text-muted">online</div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 text-[13px] leading-[1.45]">
                    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#d9fdd3] px-3.5 py-2 text-[#111] dark:bg-[#005c4b] dark:text-[#e9edef]">
                      <div className="font-semibold">New Order</div>
                      {lines.map((l) => (
                        <div key={l.p.id}>
                          {l.q}× {l.p.name} (₹{l.p.price * l.q})
                        </div>
                      ))}
                      {lines.length > 0 ? <div className="mt-1 font-semibold">Total: ₹{total}</div> : <div className="skeleton mt-1 h-3 w-24 rounded bg-black/10" />}
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] opacity-60">
                        10:42 <Check className="h-3 w-3" /><Check className="-ml-2 h-3 w-3" />
                      </div>
                    </div>
                    <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2 ring-1 ring-line">
                      Got it, thank you! Confirming your address now 🙂
                      <div className="mt-0.5 text-right text-[10.5px] text-muted">10:44</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-[13px] font-semibold tabular-nums text-background">
      {n}
    </span>
  )
}

function FakeField({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-2.5">
      {icon && <MapPin className="h-4 w-4 text-muted" strokeWidth={1.75} />}
      <div className="leading-tight">
        <div className="text-[11px] text-subtle">{label}</div>
        <div className="text-[14px]">{value}</div>
      </div>
    </div>
  )
}
