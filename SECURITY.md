# Admin, database & security

## How it works

| Part | What it does |
| --- | --- |
| **Postgres (Neon)** | Stores products (with photos), customer details, admin accounts and sessions. Only the server talks to it; the connection string never reaches the browser. |
| **Better Auth** | Admin login with a fixed email + password. Passwords are hashed (scrypt). **Public sign-up is disabled.** Sessions last 8 hours, stored in Postgres, in an `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie. |
| **Brute-force protection** | 5 sign-in attempts per 5 minutes per IP (stored in Postgres, so it holds across servers). |
| **`src/proxy.ts`** | No session cookie → `/admin` redirects to `/admin/login` before anything renders. |
| **`src/lib/admin.ts`** | The dashboard page and **every** admin action re-verify the session in the database and require `role = 'admin'`. |
| **Server Actions** | All writes (products, stock, admins, password) go through server actions, which Next.js protects against cross-site requests. |
| **Uploads** | Every photo is re-encoded on the server (strips hidden data such as GPS location, rejects files that aren't images, resizes to 1200px). |
| **SQL** | Every query is parameterized. No string-built SQL. |
| **Headers** | Strict CSP (the site only talks to itself), `X-Frame-Options: DENY`, `nosniff`, HSTS, strict referrer and permissions policies. |

## Commands

```bash
npm run db:setup      # create/upgrade all tables (safe to re-run)
npm run admin:seed    # create the admin from ADMIN_EMAIL / ADMIN_PASSWORD, or reset its password
```

### Changing the admin email or password
Either sign in and use **Change your password** in the dashboard, or edit `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` and run `npm run admin:seed` (signs that account out everywhere). Other admins can be added and removed from the dashboard.

## Deploying (e.g. Vercel)

Set these environment variables on the host (never commit them):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Your Neon connection string |
| `BETTER_AUTH_SECRET` | A long random string: `openssl rand -base64 48` (use a different one than local) |
| `BETTER_AUTH_URL` | Your site's public URL, e.g. `https://naturalremedies.in` |

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are only needed when running `npm run admin:seed`, not on the server.

## The old Firestore database

The site no longer uses Firebase. The old Firestore still holds the earlier customer details and is **still publicly readable** until you lock it. `firestore.rules` now denies everything. Publish it once:

```bash
npx firebase-tools@13 login
npm run firestore:lock
```

Or paste `firestore.rules` into Firebase console → Firestore → Rules → Publish. After that you can delete the Firebase project entirely if you like.
