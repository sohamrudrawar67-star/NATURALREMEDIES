'use server'

import { headers } from 'next/headers'
import { pool } from '@/lib/db'

// Per-IP throttle for the public "save my details" action. Best effort, per server instance.
const hits = new Map<string, { count: number; reset: number }>()
function throttled(key: string, max = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs })
    return false
  }
  entry.count += 1
  return entry.count > max
}

/**
 * Keeps a copy of a customer's delivery details for the shop.
 * Write-only from the public site: there is no public way to read customer data back.
 */
export async function saveCustomer(input: { name: string; phone: string; address: string }) {
  const name = String(input?.name ?? '').trim().replace(/\s+/g, ' ')
  const phone = String(input?.phone ?? '').trim()
  const address = String(input?.address ?? '').trim()
  const digits = phone.replace(/\D/g, '')

  if (!name || name.length > 80 || !address || address.length > 400) return { ok: false }
  if (digits.length < 10 || digits.length > 13 || phone.length > 18) return { ok: false }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (throttled(ip)) return { ok: false }

  try {
    await pool.query('insert into customer (name, phone, address) values ($1, $2, $3)', [name, phone, address])
    return { ok: true }
  } catch (error) {
    console.error('[saveCustomer]', error)
    return { ok: false }
  }
}
