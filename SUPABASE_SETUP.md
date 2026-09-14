# Supabase Setup — Shopio (STEP A)

Follow these steps to connect Shopio to your own Supabase project.

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), sign in, and create a new project.
Wait for provisioning to finish.

## 2. Copy the project URL

In your Supabase project dashboard, go to **Project Settings → API**.
Copy the **Project URL**.

## 3. Copy the publishable (anon) key

On the same **API** settings page, copy the **anon / publishable** key.
Never use the **service_role** secret key in this app — it must never be exposed to the browser.

## 4. Add credentials to `.env.local`

In the project root, open (or create) `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key
```

`GEMINI_API_KEY` is not used yet — it will be needed in STEP C.
`.env.local` is already listed in `.gitignore` and must never be committed.

## 5. Run the schema

Open the Supabase **SQL Editor**, paste the full contents of `supabase/schema.sql`, and run it.
This creates the `profiles`, `products`, `orders`, and `order_items` tables, the signup trigger,
the `is_admin()` helper, all Row Level Security policies, and the `product-images` storage bucket.

## 6. Run the seed data

Open the SQL Editor again, paste the full contents of `supabase/seed.sql`, and run it.
This adds around 12 demo products used for browsing, search, and category filtering.

## 7. Create a normal account

Start the app (`npm run dev`) and use the **Sign Up** page to create a normal customer account.
Every new signup is automatically given the `customer` role — there is no way to self-assign `admin`.

## 8. Admin role (future step)

STEP A does not include an admin UI. To promote an account to admin later (STEP B), an existing
Supabase project maintainer will manually run, in the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'the_account_email@example.com';
```

This is intentionally a manual, dashboard-only action for security.
