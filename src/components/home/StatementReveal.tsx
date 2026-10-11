'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, MotionValue } from 'motion/react'

/** Words light up as you read down — the paragraph keeps pace with your scroll. */
export function StatementReveal({ text, emphasis = [] }: { text: string; emphasis?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')

  return (
    <section className="mx-auto max-w-[1040px] px-6 py-12 sm:py-[24vh]">
      <p
        ref={ref}
        className="text-balance text-[clamp(28px,4.4vw,56px)] font-semibold leading-[1.12] tracking-[-0.035em]"
      >
        {words.map((word, i) => (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1) / words.length]}
            serif={emphasis.includes(word.replace(/[.,—]/g, ''))}
            still={!!reduceMotion}
          >
            {word}
          </Word>
        ))}
      </p>
    </section>
  )
}

function Word({
  children,
  progress,
  range,
  serif,
  still,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  serif: boolean
  still: boolean
}) {
  const opacity = useTransform(progress, range, [0.5, 1])
  return (
    <>
      <motion.span
        style={{ opacity: still ? 1 : opacity }}
        className={serif ? 'font-serif font-normal italic tracking-[-0.015em] text-primary' : undefined}
      >
        {children}
      </motion.span>{' '}
    </>
  )
}
