/**
 * Creates the fixed admin login from ADMIN_EMAIL / ADMIN_PASSWORD in .env.local,
 * or resets that account's password if it already exists. Safe to re-run.
 *   npm run admin:seed
 */
import { auth } from '../src/lib/auth'
import { pool } from '../src/lib/db'

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set a valid ADMIN_EMAIL in .env.local')
  if (!password || password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters')

  const ctx = await auth.$context
  const hash = await ctx.password.hash(password)
  const existing = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true })

  if (existing) {
    await ctx.internalAdapter.updateUser(existing.user.id, { role: 'admin' })
    const credential = existing.accounts.find((a) => a.providerId === 'credential')
    if (credential) {
      await ctx.internalAdapter.updatePassword(existing.user.id, hash)
    } else {
      await ctx.internalAdapter.linkAccount({ userId: existing.user.id, providerId: 'credential', accountId: existing.user.id, password: hash })
    }
    // Password changed: sign out everywhere
    await ctx.internalAdapter.deleteUserSessions(existing.user.id)
    console.log(`Updated admin ${email} (password reset, sessions cleared)`)
    return
  }

  const user = await ctx.internalAdapter.createUser({ email, name: 'Admin', emailVerified: true, role: 'admin' }, { method: 'admin' })
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: 'credential', accountId: user.id, password: hash })
  console.log(`Created admin ${email}`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
