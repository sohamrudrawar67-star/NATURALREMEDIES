'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { ID_RE } from '@/lib/catalog'
import { uniqueSlug } from '@/lib/slug'

/*
 * Every action re-checks the admin session against the database before touching data.
 * Server Actions also reject cross-site requests (Next.js compares Origin and Host).
 */

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

async function guarded<T>(fn: () => Promise<T>, opts: { touchesCatalog?: boolean } = {}): Promise<Result<T>> {
  try {
    await requireAdmin()
    const data = await fn()
    // Refresh the pre-rendered shop, product pages, sitemap and llms.txt
    if (opts.touchesCatalog) revalidatePath('/', 'layout')
    return { ok: true, data }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { ok: false, error: 'Your session has ended. Please sign in again.' }
    }
    if (error instanceof UserError) return { ok: false, error: error.message }
    console.error('[admin action]', error)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

class UserError extends Error {}

const MAX_UPLOAD = 8 * 1024 * 1024
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Re-encodes any upload: strips metadata (incl. GPS), normalizes size, rejects non-images. */
async function processImage(file: File) {
  if (file.size === 0) return null
  if (file.size > MAX_UPLOAD) throw new UserError('That photo is too large (max 8MB).')
  try {
    return await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  } catch {
    throw new UserError('That file isn’t a photo we can read. Try a JPG or PNG.')
  }
}

function readProductFields(form: FormData) {
  const name = String(form.get('name') ?? '').trim()
  const description = String(form.get('description') ?? '').trim()
  const price = Number(form.get('price'))
  const isOutOfStock = form.has('isOutOfStock') ? form.get('isOutOfStock') === 'true' : false
  if (!name || name.length > 120) throw new UserError('Enter a product name (up to 120 characters).')
  if (description.length > 2000) throw new UserError('The description is too long.')
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) throw new UserError('Enter a valid price.')
  return { name, description, price: Math.round(price), isOutOfStock }
}

export async function saveProduct(form: FormData): Promise<Result> {
  return guarded(async () => {
    const id = form.get('id') ? String(form.get('id')) : null
    if (id && !ID_RE.test(id)) throw new UserError('Unknown product.')
    const { name, description, price, isOutOfStock } = readProductFields(form)
    const upload = form.get('image')
    const image = upload instanceof File ? await processImage(upload) : null

    if (id) {
      const { rowCount } = image
        ? await pool.query(
            `update product set name=$2, description=$3, price=$4, is_out_of_stock=$5, image=$6, image_type='image/jpeg', updated_at=now() where id=$1`,
            [id, name, description, price, isOutOfStock, image]
          )
        : await pool.query(
            `update product set name=$2, description=$3, price=$4, is_out_of_stock=$5, updated_at=now() where id=$1`,
            [id, name, description, price, isOutOfStock]
          )
      if (!rowCount) throw new UserError('That product no longer exists.')
    } else {
      if (!image) throw new UserError('Add a photo.')
      await pool.query(
        `insert into product (name, description, price, is_out_of_stock, image, image_type, slug, sort_order)
         values ($1, $2, $3, $4, $5, 'image/jpeg', $6, (select coalesce(max(sort_order), 0) + 1 from product))`,
        // Readable URL from the name (kept stable afterwards, so links never break)
        [name, description, price, isOutOfStock, image, await uniqueSlug(name)]
      )
    }
    return undefined
  }, { touchesCatalog: true })
}

export async function deleteProduct(id: string): Promise<Result> {
  return guarded(async () => {
    if (!ID_RE.test(id)) throw new UserError('Unknown product.')
    await pool.query('delete from product where id = $1', [id])
    return undefined
  }, { touchesCatalog: true })
}

export async function setOutOfStock(id: string, outOfStock: boolean): Promise<Result> {
  return guarded(async () => {
    if (!ID_RE.test(id)) throw new UserError('Unknown product.')
    await pool.query('update product set is_out_of_stock = $2, updated_at = now() where id = $1', [id, outOfStock === true])
    return undefined
  }, { touchesCatalog: true })
}

// ---------- Admin accounts ----------

export type AdminAccount = { id: string; name: string; email: string; createdAt: string }

export async function listAdmins(): Promise<Result<AdminAccount[]>> {
  return guarded(async () => {
    const { rows } = await pool.query<{ id: string; name: string; email: string; createdAt: Date }>(
      `select id, name, email, "createdAt" from "user" where role = 'admin' order by "createdAt" asc`
    )
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
  })
}

export async function createAdmin(input: { name: string; email: string; password: string }): Promise<Result> {
  return guarded(async () => {
    const name = String(input?.name ?? '').trim().slice(0, 80)
    const email = String(input?.email ?? '').trim().toLowerCase()
    const password = String(input?.password ?? '')
    if (!name) throw new UserError('Enter a name.')
    if (!EMAIL_RE.test(email) || email.length > 254) throw new UserError('Enter a valid email.')
    if (password.length < 12 || password.length > 128) throw new UserError('Password must be 12–128 characters.')

    const ctx = await auth.$context
    if (await ctx.internalAdapter.findUserByEmail(email)) throw new UserError('An account with that email already exists.')
    const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true, role: 'admin' }, { method: 'admin' })
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password: await ctx.password.hash(password),
    })
    return undefined
  })
}

export async function removeAdmin(userId: string): Promise<Result> {
  return guarded(async () => {
    const me = await requireAdmin()
    if (userId === me.id) throw new UserError('You can’t remove your own account.')
    const ctx = await auth.$context
    const user = await ctx.internalAdapter.findUserById(userId)
    if (!user) throw new UserError('That admin no longer exists.')
    await ctx.internalAdapter.deleteUserSessions(userId)
    await ctx.internalAdapter.deleteAccounts(userId)
    await ctx.internalAdapter.deleteUser(userId)
    return undefined
  })
}

export async function changeMyPassword(input: { current: string; next: string }): Promise<Result> {
  return guarded(async () => {
    const next = String(input?.next ?? '')
    if (next.length < 12 || next.length > 128) throw new UserError('New password must be 12–128 characters.')
    try {
      await auth.api.changePassword({
        body: { currentPassword: String(input?.current ?? ''), newPassword: next, revokeOtherSessions: true },
        headers: await headers(),
      })
    } catch {
      throw new UserError('Your current password is incorrect.')
    }
    return undefined
  })
}
