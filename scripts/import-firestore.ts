/**
 * One-off: copies the products from the old Firestore database into Postgres,
 * recompressing the photos (≈500KB PNG → ≈100KB JPEG). Keeps the same product IDs
 * so existing /products/<id> links keep working. Skips products already imported.
 *   npm run db:import-firestore
 */
import sharp from 'sharp'
import { pool } from '../src/lib/db'

const URL_ = 'https://firestore.googleapis.com/v1/projects/naturalremedies-772100/databases/(default)/documents/products?pageSize=100'

type FsValue = { stringValue?: string; integerValue?: string; doubleValue?: number; booleanValue?: boolean }
type FsDoc = { name: string; fields: Record<string, FsValue> }

async function main() {
  const res = await fetch(URL_)
  if (!res.ok) throw new Error(`Firestore returned ${res.status} (already locked down? nothing to import)`)
  const { documents = [] } = (await res.json()) as { documents?: FsDoc[] }

  for (const [index, d] of documents.entries()) {
    const id = d.name.split('/').pop()!
    const f = d.fields
    const name = f.name?.stringValue?.trim()
    const price = Number(f.price?.integerValue ?? f.price?.doubleValue)
    if (!name || !Number.isFinite(price) || price <= 0) {
      console.warn(`skip ${id}: missing name/price`)
      continue
    }

    let image: Buffer | null = null
    const dataUrl = f.image?.stringValue
    const match = dataUrl?.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/)
    if (match) {
      image = await sharp(Buffer.from(match[2], 'base64'))
        .rotate()
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()
    }

    const { rowCount } = await pool.query(
      `insert into product (id, name, price, description, image, image_type, is_out_of_stock, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do nothing`,
      [id, name.slice(0, 120), Math.round(price), (f.description?.stringValue ?? '').slice(0, 2000), image, image ? 'image/jpeg' : null, f.isOutOfStock?.booleanValue ?? false, index]
    )
    console.log(`${rowCount ? 'imported' : 'exists  '} ${name}${image ? ` (${Math.round(image.length / 1024)}KB photo)` : ''}`)
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
