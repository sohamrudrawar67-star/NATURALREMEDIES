'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="enter mx-auto flex min-h-[78svh] max-w-md flex-col items-center justify-center px-6 pt-20 text-center">
      <h1 className="text-[32px] font-semibold tracking-[-0.04em]">Something went wrong.</h1>
      <p className="mt-3 text-[16px] text-muted">It&rsquo;s on our side. Try again, and if it keeps happening, message us on WhatsApp.</p>
      <button onClick={reset} className="press btn-primary mt-8 h-11 px-6 text-[15px]">
        Try again
      </button>
    </div>
  )
}
