'use client'

import { Product, useCartStore } from '@/store/useCartStore'
import { Plus, Minus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useHydrated } from '@/lib/useHydrated'

interface CartQuantityButtonProps {
  product: Product
  className?: string
  large?: boolean
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/**
 * "Add" morphs into a stepper in place. Same footprint in both states so nothing
 * around it shifts; the swap is a blurred crossfade so it reads as one object changing.
 */
export function CartQuantityButton({ product, className, large = false }: CartQuantityButtonProps) {
  const hydrated = useHydrated()
  const router = useRouter()
  const quantity = useCartStore((s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0)
  const { addItem, updateQuantity, removeItem } = useCartStore()

  const size = large ? 'h-[52px] text-[16px] w-full sm:w-[260px]' : 'h-9 text-[13.5px] w-[104px]'

  if (!hydrated) {
    return <div className={cn('rounded-full bg-surface-2', size, className)} aria-hidden />
  }

  if (product.isOutOfStock) {
    return (
      <button disabled className={cn('rounded-full bg-surface-2 font-medium text-subtle cursor-not-allowed', size, className)}>
        Sold out
      </button>
    )
  }

  const add = () => {
    addItem(product)
    toast(`${product.name} added`, {
      description: 'It’s waiting in your basket.',
      action: { label: 'View basket', onClick: () => router.push('/cart') },
      duration: 2600,
    })
  }

  const decrement = () => (quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1))
  const increment = () => updateQuantity(product.id, quantity + 1)

  const swap = {
    initial: { opacity: 0, filter: 'blur(4px)', transform: 'scale(0.96)' },
    animate: { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
    exit: { opacity: 0, filter: 'blur(4px)', transform: 'scale(0.96)' },
    transition: { duration: 0.2, ease: EASE_OUT },
  }

  return (
    <div className={cn('relative', size, className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {quantity === 0 ? (
          <motion.button
            key="add"
            {...swap}
            onClick={add}
            className="press btn-primary absolute inset-0 h-full w-full"
          >
            {large ? (
              <>
                Add to basket <span className="opacity-60">·</span> <span className="tabular-nums">₹{product.price}</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} /> Add
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            {...swap}
            className="absolute inset-0 flex items-center justify-between rounded-full bg-tint border border-primary/25 px-1 text-tint-foreground shadow-sm"
          >
            <button
              onClick={decrement}
              aria-label={quantity === 1 ? 'Remove from basket' : 'Decrease quantity'}
              className={cn('press grid place-items-center rounded-full hover:bg-primary/15', large ? 'h-11 w-11' : 'h-7 w-7')}
            >
              <Minus className={large ? 'h-4 w-4' : 'h-3.5 w-3.5'} strokeWidth={2.25} />
            </button>
            <span className="relative overflow-hidden font-semibold tabular-nums">
              {/* Digit roll — the number you changed is the thing that moves */}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={quantity}
                  initial={{ transform: 'translateY(70%)', opacity: 0 }}
                  animate={{ transform: 'translateY(0%)', opacity: 1 }}
                  exit={{ transform: 'translateY(-70%)', opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className="inline-block"
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
              {large && <span className="ml-1 font-normal opacity-70">in basket</span>}
            </span>
            <button
              onClick={increment}
              aria-label="Increase quantity"
              className={cn('press grid place-items-center rounded-full hover:bg-primary/15', large ? 'h-11 w-11' : 'h-7 w-7')}
            >
              <Plus className={large ? 'h-4 w-4' : 'h-3.5 w-3.5'} strokeWidth={2.25} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
