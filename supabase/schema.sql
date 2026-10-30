-- Run this in the cafe owner's Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.cafe_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  image_url text not null default '',
  available boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null default '',
  customer_note text not null default '',
  order_type text not null default 'استلام من القهوة',
  status text not null default 'new' check (status in ('new','confirmed','preparing','ready','completed','cancelled')),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

alter table public.cafe_admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.is_cafe_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cafe_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_cafe_admin() from public;
grant execute on function public.is_cafe_admin() to anon, authenticated;

create policy "admins can read admin mapping" on public.cafe_admins
for select to authenticated using (user_id = (select auth.uid()));

create policy "public read active categories" on public.categories
for select to anon, authenticated using (is_active = true or (select public.is_cafe_admin()));

create policy "admins manage categories" on public.categories
for all to authenticated using ((select public.is_cafe_admin())) with check ((select public.is_cafe_admin()));

create policy "public read available products" on public.products
for select to anon, authenticated using (available = true or (select public.is_cafe_admin()));

create policy "admins manage products" on public.products
for all to authenticated using ((select public.is_cafe_admin())) with check ((select public.is_cafe_admin()));

-- Public visitors cannot directly insert orders or order items in this starter.
-- WhatsApp checkout sends a pre-filled message. If database orders are enabled later,
-- add a server-validated RPC/Edge Function and restrictive policies; never trust client totals.

-- Storage setup:
-- In Supabase Dashboard > Storage, create a PUBLIC bucket named menu-images.
-- Then add these policies in Storage > Policies, or run equivalent policies below:
create policy "Public can view menu images" on storage.objects
for select to public using (bucket_id = 'menu-images');

create policy "Cafe admins upload menu images" on storage.objects
for insert to authenticated with check (bucket_id = 'menu-images' and (select public.is_cafe_admin()));

create policy "Cafe admins update menu images" on storage.objects
for update to authenticated using (bucket_id = 'menu-images' and (select public.is_cafe_admin()))
with check (bucket_id = 'menu-images' and (select public.is_cafe_admin()));

create policy "Cafe admins delete menu images" on storage.objects
for delete to authenticated using (bucket_id = 'menu-images' and (select public.is_cafe_admin()));

-- Setup the first owner:
-- 1) Create the owner user in Supabase Dashboard > Authentication > Users.
-- 2) Copy that user's UUID.
-- 3) Run: insert into public.cafe_admins (user_id) values ('OWNER-USER-UUID-HERE');
-- Never expose a service_role key in frontend code.
