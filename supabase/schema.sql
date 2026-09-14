-- ============================================================
-- SHOPIO - Database Schema (STEP A)
-- Run this file inside the Supabase SQL Editor (once, on a new project).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  keywords text[] default '{}',
  image_url text,
  stock integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text,
  email text,
  phone text,
  address text,
  subtotal numeric,
  shipping_fee numeric,
  total numeric,
  payment_method text,
  payment_status text,
  order_status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  price numeric,
  quantity integer
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Role is always hardcoded to 'customer'; it is never read from
-- client-supplied metadata, so a normal signup can never become admin.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- HELPER: is_admin()
-- SECURITY DEFINER avoids recursive RLS when profiles policies need
-- to check the caller's own role.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ---------------- PROFILES ----------------
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------- PRODUCTS ----------------
create policy "Anyone can read products"
  on public.products for select
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ---------------- ORDERS ----------------
create policy "Customers can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Customers can read own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- ---------------- ORDER ITEMS ----------------
create policy "Users can read own order items"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage all order items"
  on public.order_items for all
  using (public.is_admin());

-- ============================================================
-- STORAGE: product-images bucket
-- Public read access; only admins can upload/update/delete.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
