import { findProductImage } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const index = Math.max(0, parseInt(searchParams.get('index') || '0', 10) || 0)
  try {
    const row = await findProductImage(id, index)
    if (!row) return new Response('Not found', { status: 404 })
    return new Response(new Uint8Array(row.image), {
      headers: {
        'Content-Type': row.image_type,
        'Content-Length': String(row.image.length),
        // URL carries ?v=<updated_at>, so a new upload gets a new URL
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    })
  } catch (error) {
    console.error('[api/products/:id/image]', error)
    return new Response('Error', { status: 500 })
  }
}
