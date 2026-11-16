# Supabase Setup — Shopio

Follow these steps to connect Shopio to your own Supabase project.

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), sign in and create a new project.
Wait until it has finished setting up.

## 2. Copy the project URL

In the project dashboard open **Project Settings → API** (or the **Connect** button) and copy the
**Project URL**.

## 3. Copy the publishable key

On the same page copy the **publishable** key (older projects call it the **anon / public** key).

Never use the **service_role / secret** key in this app. It bypasses all security rules and must
never be exposed to the browser. Shopio does not need it.

## 4. Add them to `.env.local`

Copy `.env.example` to `.env.local` in the project root and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key
```

`.env.local` is git-ignored and must never be committed.
Get a Gemini key from [Google AI Studio](https://aistudio.google.com/apikey) (needed for AI image search).

## 5. Run `supabase/schema.sql`

Open **SQL Editor → New query**, paste the full contents of `supabase/schema.sql` and click **Run**.

This creates:

- tables `profiles`, `products`, `orders`, `order_items`
- the signup trigger (every new user gets a `customer` profile)
- the `is_admin()` helper and the `place_order()` function used by checkout
- all Row Level Security policies
- the public `product-images` storage bucket and its admin-only upload policies

The file is safe to run again. **If you ran an older version of `schema.sql` before, run the new
one again** — it closes a security hole (customers could change their own role) and adds
`place_order()`, which checkout needs.

## 6. Run `supabase/seed.sql`

Open a new query, paste the contents of `supabase/seed.sql` and click **Run**.
This adds 12 demo products with images. Running it again does not create duplicates.

## 7. Email confirmation (choose one)

By default Supabase asks new users to confirm their email before they can log in.

- **Simplest for a demo / viva:** go to **Authentication → Sign In / Providers → Email** and turn
  off **Confirm email**. New users are logged in immediately after signing up.
- **Keep it on:** Shopio shows "Check your email" after signup. The confirmation link returns
  to `/auth/callback`. Make sure **Authentication → URL Configuration** contains your site URL
  (`http://localhost:3000` locally, your Vercel URL in production) and add
  `http://localhost:3000/**` and `https://YOUR-APP.vercel.app/**` to **Redirect URLs**.
  Note: Supabase's built-in email service only sends a few emails per hour.

## 8. Create a normal account

Run the app (`npm run dev`), open **Sign Up** and create an account.
Every new signup is a `customer` — there is no way to choose `admin` on the website.

## 9. Promote one account to admin

In the **SQL Editor** run (use the email you signed up with):

```sql
update public.profiles
set role = 'admin'
where email = 'ADMIN_EMAIL';
```

Refresh the page. The **Admin** link appears in the navbar and `/admin` opens the
admin dashboard.

You only need SQL for this **first** admin. After that, go to **Admin → Users** to make other
accounts admin or customer (an admin cannot change their own role, so there is always one admin).

## 10. Payment setup

Go to **Admin → Payments** to turn payment methods on/off (Cash on Delivery, bKash, Nagad,
Rocket, Card, Bank Transfer), set your bKash / Nagad / Rocket merchant numbers and bank account,
and mark customer payments as Paid or Failed after checking the TrxID.

## 11. Production (Vercel)

In **Authentication → URL Configuration** set **Site URL** to your Vercel URL
(e.g. `https://shopio.vercel.app`) and add `https://shopio.vercel.app/**` to **Redirect URLs**.
