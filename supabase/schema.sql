-- ============================================================
-- SHOPIO - Database Schema
-- Run this whole file in the Supabase SQL Editor.
-- It is safe to run again: tables are kept, and functions,
-- policies and constraints are recreated.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- PROFILES: one row per Supabase Auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default now()
);

-- PRODUCTS: the single-vendor catalog.
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

-- ORDERS: one row per checkout.
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

-- Demo online payments keep only safe details:
--   account_last4     = last 4 digits of the card or bKash/Nagad/Rocket number
--   payment_reference = mobile banking TrxID or bank transfer reference
-- The full card number, expiry, CVV, PIN or OTP are NEVER stored.
alter table public.orders add column if not exists account_last4 text;
alter table public.orders add column if not exists payment_reference text;

-- ORDER ITEMS: products inside an order (name and price are saved as a snapshot).
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  price numeric,
  quantity integer
);

-- PAYMENT SETTINGS: one row that the admin edits on /admin/payments.
-- Turns payment methods on/off and stores the (demo) merchant numbers and bank account.
create table if not exists public.payment_settings (
  id integer primary key default 1 check (id = 1),
  cod_enabled boolean not null default true,
  bkash_enabled boolean not null default true,
  bkash_number text not null default '01700000001',
  nagad_enabled boolean not null default true,
  nagad_number text not null default '01700000002',
  rocket_enabled boolean not null default true,
  rocket_number text not null default '01700000003',
  card_enabled boolean not null default true,
  bank_enabled boolean not null default true,
  bank_name text not null default 'Demo Bank PLC',
  bank_account_name text not null default 'Shopio Ltd.',
  bank_account_number text not null default '1234-5678-9012',
  bank_branch text not null default 'Gulshan, Dhaka',
  updated_at timestamp with time zone default now()
);

insert into public.payment_settings (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Indexes (faster "my orders", order items and related-product lookups)
-- ------------------------------------------------------------
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- ------------------------------------------------------------
-- Simple data rules (checked by the database itself)
-- ------------------------------------------------------------
alter table public.products drop constraint if exists products_price_check;
alter table public.products add constraint products_price_check check (price >= 0);

alter table public.products drop constraint if exists products_stock_check;
alter table public.products add constraint products_stock_check check (stock >= 0);

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('cod', 'bkash', 'nagad', 'rocket', 'card', 'bank'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'paid_demo', 'failed'));

alter table public.orders drop constraint if exists orders_order_status_check;
alter table public.orders add constraint orders_order_status_check
  check (order_status in ('pending', 'processing', 'completed', 'cancelled'));

alter table public.orders drop constraint if exists orders_account_last4_check;
alter table public.orders add constraint orders_account_last4_check
  check (account_last4 is null or account_last4 ~ '^[0-9]{4}$');

alter table public.orders drop constraint if exists orders_payment_reference_check;
alter table public.orders add constraint orders_payment_reference_check
  check (payment_reference is null or payment_reference ~ '^[A-Z0-9-]{6,30}$');

alter table public.order_items drop constraint if exists order_items_quantity_check;
alter table public.order_items add constraint order_items_quantity_check check (quantity > 0);

-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- The role is always 'customer'. It is never read from the signup
-- form, so nobody can sign up as admin.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep products.updated_at correct whenever a product is edited.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

drop trigger if exists payment_settings_set_updated_at on public.payment_settings;
create trigger payment_settings_set_updated_at
  before update on public.payment_settings
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 3. HELPER: is_admin()
-- SECURITY DEFINER lets it read profiles without triggering the
-- profiles RLS policies again (avoids recursive RLS).
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ============================================================
-- 4. PLACE ORDER
-- The only way customers can create orders. The browser sends just
-- product IDs and quantities; prices are read from the products
-- table here, so a customer can never change what they pay.
-- The order and its items are saved together (one transaction).
-- Payment methods (Bangladesh): cod, bkash, nagad, rocket, card, bank.
-- All online payments are DEMO only (no real money moves).
-- ============================================================
drop function if exists public.place_order(text, text, text, text, text, text, jsonb);

create or replace function public.place_order(
  p_full_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_payment_method text,
  p_account_last4 text,
  p_payment_reference text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_shipping_fee numeric := 80;
  v_subtotal numeric := 0;
  v_order_id uuid;
  v_item jsonb;
  v_quantity integer;
  v_product public.products%rowtype;
  v_settings public.payment_settings%rowtype;
begin
  if v_user_id is null then
    raise exception 'Please log in to place your order.';
  end if;

  if coalesce(trim(p_full_name), '') = '' or coalesce(trim(p_email), '') = ''
     or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Please fill in all delivery details.';
  end if;

  -- Bangladeshi mobile number: 01XXXXXXXXX (11 digits)
  if trim(p_phone) !~ '^01[3-9][0-9]{8}$' then
    raise exception 'Please enter a valid Bangladeshi mobile number (01XXXXXXXXX).';
  end if;

  if p_payment_method not in ('cod', 'bkash', 'nagad', 'rocket', 'card', 'bank') then
    raise exception 'Please choose a valid payment method.';
  end if;

  -- The admin can turn payment methods off on /admin/payments.
  select * into v_settings from public.payment_settings where id = 1;
  -- (The CASE is wrapped in brackets so PL/pgSQL does not stop reading at its first THEN.)
  if found and not (case p_payment_method
      when 'cod' then v_settings.cod_enabled
      when 'bkash' then v_settings.bkash_enabled
      when 'nagad' then v_settings.nagad_enabled
      when 'rocket' then v_settings.rocket_enabled
      when 'card' then v_settings.card_enabled
      when 'bank' then v_settings.bank_enabled
    end) then
    raise exception 'This payment method is currently unavailable. Please choose another one.';
  end if;

  -- Card and mobile banking need the last 4 digits of the card / wallet number.
  if p_payment_method in ('bkash', 'nagad', 'rocket', 'card')
     and (p_account_last4 is null or p_account_last4 !~ '^[0-9]{4}$') then
    raise exception 'Invalid payment details.';
  end if;

  -- Mobile banking and bank transfer need a transaction / reference ID.
  if p_payment_method in ('bkash', 'nagad', 'rocket', 'bank')
     and (p_payment_reference is null or upper(p_payment_reference) !~ '^[A-Z0-9-]{6,30}$') then
    raise exception 'Please enter a valid transaction ID.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  -- Check every item and add up the subtotal using real database prices.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 99 then
      raise exception 'Invalid quantity in your cart.';
    end if;

    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    if not found then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if v_product.stock <= 0 then
      raise exception '% is out of stock.', v_product.name;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_quantity;
  end loop;

  insert into public.orders (
    user_id, full_name, email, phone, address,
    subtotal, shipping_fee, total,
    payment_method, payment_status, account_last4, payment_reference, order_status
  )
  values (
    v_user_id, trim(p_full_name), trim(p_email), trim(p_phone), trim(p_address),
    v_subtotal, v_shipping_fee, v_subtotal + v_shipping_fee,
    p_payment_method,
    -- Cash is paid on delivery; demo online payments count as paid immediately.
    case when p_payment_method = 'cod' then 'pending' else 'paid_demo' end,
    case when p_payment_method in ('bkash', 'nagad', 'rocket', 'card') then p_account_last4 end,
    case when p_payment_method in ('bkash', 'nagad', 'rocket', 'bank') then upper(trim(p_payment_reference)) end,
    'pending'
  )
  returning id into v_order_id;

  -- Save each item with a snapshot of its current name and price.
  insert into public.order_items (order_id, product_id, product_name, price, quantity)
  select v_order_id, p.id, p.name, p.price, (i->>'quantity')::integer
  from jsonb_array_elements(p_items) as i
  join public.products p on p.id = (i->>'product_id')::uuid;

  return v_order_id;
end;
$$;

-- Only logged-in users may call place_order.
revoke execute on function public.place_order(text, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.place_order(text, text, text, text, text, text, text, jsonb) to authenticated;

-- ============================================================
-- 4b. CHANGE A USER'S ROLE (admin only, used on /admin/users)
-- Customers cannot change roles (they can only edit their own full_name).
-- An admin cannot change their OWN role, so the store always keeps at
-- least one admin. The very first admin is still created manually in SQL.
-- ============================================================
create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change user roles.';
  end if;
  if p_role not in ('customer', 'admin') then
    raise exception 'Invalid role.';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role.';
  end if;

  update public.profiles set role = p_role where id = p_user_id;
  if not found then
    raise exception 'User not found.';
  end if;
end;
$$;

revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ---------------- PROFILES ----------------
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- IMPORTANT: users may only change their own full_name.
-- Without this, a customer could set their own role to 'admin' from the browser.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------------- PRODUCTS ----------------
drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
  on public.products for select
  using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check ((select public.is_admin()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using ((select public.is_admin()));

-- ---------------- ORDERS ----------------
-- No insert policy: customers create orders only through place_order().
drop policy if exists "Customers can create own orders" on public.orders;

drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders"
  on public.orders for select
  using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- ORDER ITEMS ----------------
-- No insert policy: items are created only through place_order().
drop policy if exists "Users can insert own order items" on public.order_items;
drop policy if exists "Admins can manage all order items" on public.order_items;

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
  on public.order_items for select
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
    )
  );

-- ---------------- PAYMENT SETTINGS ----------------
-- Everyone can read them (checkout shows merchant numbers); only admins can change them.
alter table public.payment_settings enable row level security;
grant select on public.payment_settings to anon, authenticated;
grant update on public.payment_settings to authenticated;

drop policy if exists "Anyone can read payment settings" on public.payment_settings;
create policy "Anyone can read payment settings"
  on public.payment_settings for select
  using (true);

drop policy if exists "Admins can update payment settings" on public.payment_settings;
create policy "Admins can update payment settings"
  on public.payment_settings for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ============================================================
-- 6. STORAGE: product-images bucket
-- Public can view images; only admins can upload/update/delete.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and (select public.is_admin()));
