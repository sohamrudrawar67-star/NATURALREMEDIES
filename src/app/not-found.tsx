import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="enter mx-auto flex min-h-[78svh] max-w-md flex-col items-center justify-center px-6 pt-20 text-center">
      <p className="font-serif text-[64px] italic leading-none text-primary">404</p>
      <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.04em]">Nothing on this shelf.</h1>
      <p className="mt-3 text-[16px] text-muted">The page you&rsquo;re after doesn&rsquo;t exist, or it moved.</p>
      <Link href="/" className="press btn-primary mt-8 h-11 px-6 text-[15px]">
        Back home
      </Link>
    </div>
  )
}
