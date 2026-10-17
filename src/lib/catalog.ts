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
  cut_price: number | null
  category: string | null
  description: string
  is_out_of_stock: boolean
  has_image: boolean
  image_count: number | string
  version: string
  slug: string | null
  updated_at: Date
}

export const ID_RE = /^[A-Za-z0-9_-]{1,64}$/

const SELECT = `
  select p.id, p.name, p.price, p.cut_price, p.category, p.description, p.is_out_of_stock,
         (p.image is not null or exists(select 1 from product_image pi where pi.product_id = p.id)) as has_image,
         coalesce(
           (select count(*)::int from product_image pi where pi.product_id = p.id),
           case when p.image is not null then 1 else 0 end
         ) as image_count,
         p.slug, p.updated_at,
         extract(epoch from p.updated_at)::bigint::text as version
  from product p`

function toProduct(row: ProductRow): Product {
  const count = Number(row.image_count || (row.has_image ? 1 : 0))
  const images = count > 0
    ? Array.from({ length: count }, (_, i) => `/api/products/${row.id}/image?index=${i}&v=${row.version}`)
    : []

  return {
    id: row.id,
    name: row.name,
    price: row.price,
    cutPrice: row.cut_price ?? undefined,
    category: row.category || 'Miscellaneous Products',
    description: row.description,
    isOutOfStock: row.is_out_of_stock,
    image: images[0],
    images,
    slug: row.slug ?? undefined,
    updatedAt: row.updated_at.toISOString(),
  }
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(`${SELECT} order by p.sort_order asc, p.price asc, p.created_at asc`)
  return rows.map(toProduct)
}

export async function listFestivalProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(
    `${SELECT} where p.category = 'Festival Celebrations' order by p.sort_order asc, p.price asc, p.created_at asc`
  )
  if (rows.length > 0) return rows.map(toProduct)

  // Graceful fallback: products with discount
  const { rows: fallback } = await pool.query<ProductRow>(
    `${SELECT} where p.cut_price is not null and p.cut_price > p.price order by p.sort_order asc, p.price asc limit 12`
  )
  return fallback.map(toProduct)
}

/** Looks a product up by its slug ("honey-500g") or, for old links, its id. */
export async function findProduct(slugOrId: string): Promise<Product | null> {
  if (!ID_RE.test(slugOrId)) return null
  const { rows } = await pool.query<ProductRow>(`${SELECT} where p.slug = $1 or p.id = $1 order by (p.slug = $1) desc limit 1`, [
    slugOrId,
  ])
  return rows[0] ? toProduct(rows[0]) : null
}

export async function findProductImage(id: string, index = 0) {
  if (!ID_RE.test(id)) return null
  // 1. First attempt to fetch from product_image table with offset
  const { rows } = await pool.query<{ image: Buffer; image_type: string }>(
    'select image, image_type from product_image where product_id = $1 order by sort_order asc, id asc offset $2 limit 1',
    [id, index]
  )
  if (rows[0]) return rows[0]

  // 2. Fallback to product.image if index === 0
  if (index === 0) {
    const fallback = await pool.query<{ image: Buffer; image_type: string }>(
      'select image, image_type from product where id = $1 and image is not null',
      [id]
    )
    return fallback.rows[0] ?? null
  }
  return null
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
