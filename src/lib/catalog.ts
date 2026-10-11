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
  slug: string | null
  updated_at: Date
}

export const ID_RE = /^[A-Za-z0-9_-]{1,64}$/

const SELECT = `
  select id, name, price, description, is_out_of_stock,
         image is not null as has_image, slug, updated_at,
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
    slug: row.slug ?? undefined,
    updatedAt: row.updated_at.toISOString(),
  }
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(`${SELECT} order by sort_order asc, price asc, created_at asc`)
  return rows.map(toProduct)
}

/** Looks a product up by its slug ("honey-500g") or, for old links, its id. */
export async function findProduct(slugOrId: string): Promise<Product | null> {
  if (!ID_RE.test(slugOrId)) return null
  const { rows } = await pool.query<ProductRow>(`${SELECT} where slug = $1 or id = $1 order by (slug = $1) desc limit 1`, [
    slugOrId,
  ])
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

/** For server-rendered pages: a database hiccup (or a build without DATABASE_URL) shows an empty shelf instead of crashing. */
export async function safeListProducts(): Promise<Product[]> {
  try {
    return await listProducts()
  } catch (error) {
    console.error('[catalog] listProducts failed:', error instanceof Error ? error.message : error)
    return []
  }
}
