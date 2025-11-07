import { defineNitroPlugin } from 'nitropack/runtime'
import { pool } from '../utils/db'

const bootstrapSQL = `
-- Habilitar función para UUIDs aleatorios
create extension if not exists pgcrypto;

-- ============================
-- Tipos
-- ============================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'supplement_status') then
    create type supplement_status as enum ('draft','pending','published','rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_supp_relation') then
    create type user_supp_relation as enum ('added','uses','favorite');
  end if;
end $$;

-- ============================
-- Usuarios (UUID autogen)
-- ============================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique,
  password_hash text,
  created_at timestamptz not null default now()
);

-- ============================
-- Admins (ref a users.id)
-- ============================
create table if not exists admins (
  user_id uuid primary key references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================
-- Suplementos (id numérico autogen)
-- ============================
create table if not exists supplements (
  id bigserial primary key,
  name text not null,
  brand text,
  form text,
  serving_size numeric,
  serving_unit text,
  per_serving jsonb,
  status supplement_status not null default 'draft',

  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),

  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text
);

create index if not exists idx_supp_status on supplements(status);
create index if not exists idx_supp_name on supplements(lower(name));
create index if not exists idx_supp_brand on supplements(lower(brand));
create index if not exists idx_supp_per_serving on supplements using gin (per_serving jsonb_path_ops);

-- ============================
-- Vínculo usuario ↔ suplemento (id autogen)
-- ============================
create table if not exists user_supplements (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  supplement_id bigint not null references supplements(id) on delete cascade,
  relation user_supp_relation not null default 'added',
  created_at timestamptz not null default now(),
  unique(user_id, supplement_id, relation)
);
`

export default defineNitroPlugin(async () => {
  const shouldBootstrap =
    process.env.NUXT_DB_BOOTSTRAP === 'true' || process.env.NUXT_DB_BOOTSTRAP === '1'

  if (!shouldBootstrap) {
    return
  }

  const url =
    process.env.SUPABASE_DB_POOL_URL || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || ''
  if (/pooler\.supabase\.com/i.test(url)) {
    console.warn(
      'Skipping DB bootstrap against Supabase pooler. Use direct connection (DATABASE_URL) to run bootstrap.'
    )
    return
  }

  try {
    await pool.query(bootstrapSQL)
    await pool.query(`
      begin;
      create extension if not exists pgcrypto;
      alter table public.users add column if not exists password_hash text;
      -- Example initial passwords (change as needed)
      update public.users
      set password_hash = crypt('Camila#2025', gen_salt('bf', 12))
      where email = 'camila@example.com'
        and (password_hash is null or password_hash = '');
      update public.users
      set password_hash = crypt('Admin#2025', gen_salt('bf', 12))
      where email = 'admin@example.com'
        and (password_hash is null or password_hash = '');
      update public.users
      set password_hash = crypt('Luis#2025', gen_salt('bf', 12))
      where email = 'luis@example.com'
        and (password_hash is null or password_hash = '');
      update public.users
      set password_hash = crypt('Ana#2025', gen_salt('bf', 12))
      where email = 'ana@example.com'
        and (password_hash is null or password_hash = '');
      commit;
    `)
    console.info('DB bootstrap completed')
  } catch (err) {
    console.error('DB bootstrap failed', err)
  }
})
