/**
 * Creates/updates every table the site needs. Safe to run repeatedly.
 *   npm run db:setup
 */
import { getMigrations } from 'better-auth/db/migration'
import { auth } from '../src/lib/auth'
import { pool } from '../src/lib/db'
import { uniqueSlug } from '../src/lib/slug'

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

-- Readable, stable URLs: /products/honey-500g
alter table product add column if not exists slug text;
create unique index if not exists product_slug_idx on product (slug);

-- Category and Cut/MRP price
alter table product add column if not exists category text default 'Miscellaneous Products';
alter table product add column if not exists cut_price integer;

-- Multiple images per product
create table if not exists product_image (
  id              serial primary key,
  product_id      text not null references product(id) on delete cascade,
  image           bytea not null,
  image_type      text not null default 'image/jpeg',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  check (octet_length(image) <= 8000000)
);
create index if not exists product_image_product_id_idx on product_image (product_id, sort_order asc);

-- Backfill existing single images into product_image if not already present
insert into product_image (product_id, image, image_type, sort_order)
select id, image, coalesce(image_type, 'image/jpeg'), 0
from product
where image is not null
and not exists (select 1 from product_image pi where pi.product_id = product.id);
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
  // Give any product without a slug one derived from its name
  const { rows } = await pool.query<{ id: string; name: string }>('select id, name from product where slug is null')
  for (const row of rows) {
    const slug = await uniqueSlug(row.name, row.id)
    await pool.query('update product set slug = $2 where id = $1', [row.id, slug])
    console.log(`  slug: ${row.name} → /products/${slug}`)
  }
  console.log('App tables: product, customer ready')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
