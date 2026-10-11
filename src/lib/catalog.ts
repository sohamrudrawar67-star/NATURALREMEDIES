import { pool } from './db'
import type { Product } from '@/store/useCartStore'

/*
 * Server-side product queries. Always parameterized ($1, $2…) — never string-built SQL.
 * Images live in Postgres as bytes and are served from /api/products/[id]/image with a
 * versioned URL, so browsers and CDNs can cache them forever.
 */

type ProductRow = {
  id: string
  name: string
  price: number
  description: string
  is_out_of_stock: boolean
  has_image: boolean
  version: string
}

export const ID_RE = /^[A-Za-z0-9_-]{1,64}$/

const SELECT = `
  select id, name, price, description, is_out_of_stock,
         image is not null as has_image,
         extract(epoch from updated_at)::bigint::text as version
  from product`

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description,
    isOutOfStock: row.is_out_of_stock,
    image: row.has_image ? `/api/products/${row.id}/image?v=${row.version}` : undefined,
  }
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(`${SELECT} order by sort_order asc, price asc, created_at asc`)
  return rows.map(toProduct)
}

export async function findProduct(id: string): Promise<Product | null> {
  if (!ID_RE.test(id)) return null
  const { rows } = await pool.query<ProductRow>(`${SELECT} where id = $1`, [id])
  return rows[0] ? toProduct(rows[0]) : null
}

export async function findProductImage(id: string) {
  if (!ID_RE.test(id)) return null
  const { rows } = await pool.query<{ image: Buffer; image_type: string }>(
    'select image, image_type from product where id = $1 and image is not null',
    [id]
  )
  return rows[0] ?? null
}
