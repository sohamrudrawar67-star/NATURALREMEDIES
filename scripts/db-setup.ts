/**
 * Creates/updates every table the site needs. Safe to run repeatedly.
 *   npm run db:setup
 */
import { getMigrations } from 'better-auth/db/migration'
import { auth } from '../src/lib/auth'
import { pool } from '../src/lib/db'

const APP_SCHEMA = `
create table if not exists product (
  id              text primary key default replace(gen_random_uuid()::text, '-', ''),
  name            text not null check (char_length(name) between 1 and 120),
  price           integer not null check (price > 0 and price <= 1000000),
  description     text not null default '' check (char_length(description) <= 2000),
  image           bytea,
  image_type      text check (image_type in ('image/jpeg', 'image/png', 'image/webp')),
  is_out_of_stock boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (image is null or octet_length(image) <= 2000000)
);

create table if not exists customer (
  id         bigserial primary key,
  name       text not null check (char_length(name) between 1 and 80),
  phone      text not null check (char_length(phone) between 10 and 18),
  address    text not null check (char_length(address) between 1 and 400),
  created_at timestamptz not null default now()
);
create index if not exists customer_created_at_idx on customer (created_at desc);
`

async function main() {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options)
  if (toBeCreated.length || toBeAdded.length) {
    console.log('Auth tables:', [...toBeCreated, ...toBeAdded].map((t) => t.table).join(', '))
    await runMigrations()
  } else {
    console.log('Auth tables: up to date')
  }
  await pool.query(APP_SCHEMA)
  console.log('App tables: product, customer ready')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
