import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await listProducts()
    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[api/products]', error)
    return NextResponse.json({ error: 'Could not load products' }, { status: 500 })
  }
}
