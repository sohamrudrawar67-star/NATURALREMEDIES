import { NextResponse } from 'next/server'
import { findProduct } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const product = await findProduct(id)
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[api/products/:id]', error)
    return NextResponse.json({ error: 'Could not load product' }, { status: 500 })
  }
}
