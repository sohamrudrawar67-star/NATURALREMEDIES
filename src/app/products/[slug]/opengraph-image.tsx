import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { findProduct, findProductImage } from '@/lib/catalog'
import { SITE_NAME } from '@/lib/site'

export const alt = `Product from ${SITE_NAME}`
export const size = { width: 1200, height: 630 }
// JPEG, not PNG: a photo card as PNG is ~1MB, and WhatsApp skips previews over ~300KB
export const contentType = 'image/jpeg'
export const revalidate = 300

export default async function ProductOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await findProduct(slug).catch(() => null)
  const photo = product ? await findProductImage(product.id).catch(() => null) : null
  const src = photo ? `data:${photo.image_type};base64,${Buffer.from(photo.image).toString('base64')}` : null

  const png = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fbfbf9', color: '#1d1d1f' }}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} width={630} height={630} alt="" style={{ objectFit: 'cover' }} />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 64 }}>
          <div style={{ fontSize: 28, color: '#4a7424', fontWeight: 600 }}>{SITE_NAME}</div>
          <div style={{ marginTop: 16, fontSize: 72, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02 }}>
            {product?.name ?? SITE_NAME}
          </div>
          {product && (
            <div style={{ marginTop: 24, fontSize: 56, fontWeight: 600, letterSpacing: -1 }}>{`₹${product.price}`}</div>
          )}
          <div style={{ marginTop: 32, fontSize: 28, color: '#6e6e73' }}>
            {product?.isOutOfStock ? 'Sold out for now' : 'Free delivery · Order on WhatsApp'}
          </div>
        </div>
      </div>
    ),
    size
  )
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
