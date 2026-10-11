import { pool } from './db'

/** "Honey (500g)" → "honey-500g" */
export function slugify(name: string) {
  return (
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'product'
  )
}

/** A slug no other product uses (adds -2, -3… if needed). */
export async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name)
  const { rows } = await pool.query<{ slug: string }>(
    `select slug from product where (slug = $1 or slug like $1 || '-%') and ($2::text is null or id <> $2)`,
    [base, excludeId ?? null]
  )
  const taken = new Set(rows.map((r) => r.slug))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
