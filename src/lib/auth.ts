import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { pool } from './db'

/*
 * Admin authentication (Better Auth, email + password, sessions in Postgres).
 * Public sign-up is OFF: admin accounts are created only by `npm run admin:seed`
 * or by an existing admin from the dashboard.
 */
export const auth = betterAuth({
  appName: 'Natural Remedies',
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      // Only 'admin' may use the dashboard. Not settable through any public endpoint.
      role: { type: 'string', required: false, defaultValue: 'user', input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 8, // 8 hours
    updateAge: 60 * 30, // refresh at most every 30 minutes of activity
  },
  rateLimit: {
    enabled: true,
    storage: 'database', // shared across server instances
    window: 60,
    max: 60,
    customRules: {
      // Slow down password guessing: 5 attempts per 5 minutes per IP
      '/sign-in/email': { window: 300, max: 5 },
    },
  },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
