import { Pool } from 'pg'

/*
 * One Postgres pool per server process (reused across hot reloads in dev).
 * Neon's pooled endpoint handles fan-out, so a small pool per instance is plenty.
 */

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.')
  }
  // pg treats sslmode=require as verify-full anyway; say so explicitly to avoid its warning
  const url = connectionString.replace('sslmode=require', 'sslmode=verify-full')
  return new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 })
}

const globalForDb = globalThis as unknown as { pgPool?: Pool }

export const pool = globalForDb.pgPool ?? createPool()
if (process.env.NODE_ENV !== 'production') globalForDb.pgPool = pool
