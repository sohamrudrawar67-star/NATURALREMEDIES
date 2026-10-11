import { headers } from 'next/headers'
import { auth } from './auth'

export type AdminUser = { id: string; email: string; name: string }

/** The signed-in admin, or null. Verifies the session against the database. */
export async function getAdmin(): Promise<AdminUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') return null
  return { id: session.user.id, email: session.user.email, name: session.user.name }
}

/** Use at the top of every admin server action. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin()
  if (!admin) throw new Error('UNAUTHORIZED')
  return admin
}
