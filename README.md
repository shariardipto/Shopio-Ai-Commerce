# Shopio — AI-Powered Single-Vendor E-commerce Web Application

## Project Overview

Shopio is a university ecommerce web application where users can browse, search and purchase
products from a single vendor.

The application includes traditional text search and AI-powered visual product search.

## Core Features

- Customer registration / login
- Product browsing
- Text search
- Category filtering
- AI image search (upload a photo **or** take one with the camera)
- Related product recommendation
- Product details
- Shopping cart
- Checkout for Bangladesh (BD mobile number check, division / district address)
- 3 payment options:
  1. Cash on Delivery
  2. Mobile banking — bKash, Nagad, Rocket (demo)
  3. Card or bank transfer (demo)
- My Orders with order progress tracker
- Admin dashboard
- Product management
- Order management

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React, Next.js (App Router), Tailwind CSS |
| Database | Supabase PostgreSQL (with Row Level Security) |
| Authentication | Supabase Auth (email + password) |
| File storage | Supabase Storage (`product-images` bucket) |
| AI | Google Gemini API (`@google/genai`, model `gemini-2.5-flash-lite`) |
| Hosting | Vercel |

## How visual search works

```
Image
 ↓
Next.js API  (/api/image-search)
 ↓
Gemini
 ↓
Object / Search Terms
 ↓
Supabase Products
 ↓
Exact Match
 OR
Related Products
```

1. The customer clicks **Image Search** next to the search box and chooses **Upload Image**
   (gallery / computer) or **Take Photo** (device camera). The photo is resized to a small
   JPEG in the browser so even large phone photos upload quickly.
2. The browser sends it to our own Next.js Route Handler `/api/image-search`.
   The Gemini API key stays on the server and is never sent to the browser.
3. Gemini returns structured JSON: the main `object` (e.g. `pen`), a `category`,
   `searchTerms` and `relatedTerms`.
4. The server searches the **real** Supabase `products` table (name, category, keywords).
5. If products match the object or search terms, they are shown as **Matching Products**.
   Otherwise products matching the related terms are shown as **Related Products**.
   Gemini never invents products — everything shown exists in the database.

Normal text search does **not** use AI: it filters the products loaded from Supabase in the browser.

## Performance & UX

- **Streaming:** the home page hero and search bar appear instantly; products stream in
  (React `use` + `Suspense`) with skeleton placeholders. Related products on the product page
  stream in the same way.
- **Fast auth checks:** `supabase.auth.getClaims()` verifies the login token locally (ES256 signing
  key), instead of calling Supabase Auth on every page view.
- **Database:** indexes on foreign keys and common lookups; RLS policies use `(select auth.uid())`
  so Postgres evaluates it once per query instead of once per row.
- **Images:** responsive `sizes`, eager loading only for images above the fold; uploaded photos
  are resized in the browser before upload.
- **UI:** animated cards and pages (disabled for users who prefer reduced motion), "Added to cart"
  toast, live cart badge, loading skeletons, order progress tracker, live demo-card preview.

## Project structure

```
src/
  app/                    pages (App Router)
    api/image-search/     Gemini image search API
    admin/                admin pages + admin Server Actions
    checkout/             checkout page + placeOrder Server Action
    auth/callback/        email confirmation link handler
  components/             reusable UI (Navbar, ProductCard, SearchBar, CartItem, ...)
  lib/                    helpers (auth, cart, search, formatting)
  utils/supabase/         Supabase browser + server clients
  proxy.js                refreshes the auth session, redirects logged-out users
supabase/
  schema.sql              tables, RLS policies, place_order(), storage bucket
  seed.sql                12 demo products
```

## Local Setup

```bash
npm install
```

Create `.env.local` in the project root (copy `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=
```

Then:

```bash
npm run dev
```

Open http://localhost:3000.

> Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
> Without it, everything works except image search, which shows
> "AI image search is not configured."
>
> Optional: if Google retires `gemini-2.5-flash-lite`, set `GEMINI_MODEL` (e.g. to a newer
> Flash model) in `.env.local` / Vercel — no code change needed.

## Supabase Setup

Full step-by-step guide: [SUPABASE_SETUP.md](SUPABASE_SETUP.md). In short, run these in the
Supabase **SQL Editor**:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

## Create an admin

1. Sign up normally in the app (every new account is a `customer`).
2. In Supabase **SQL Editor** run:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'ADMIN_EMAIL';
   ```

3. Log out and log in again. The **Admin** link appears in the navbar.

Nobody can make themselves admin from the website: the signup trigger always creates a
`customer` profile, and customers are only allowed to change their own `full_name`.

## Payments (Bangladesh, demo)

Shopio is built for Bangladesh: prices in ৳ with lakh grouping (৳1,20,000), Bangladeshi mobile
numbers (`01XXXXXXXXX` / `+8801XXXXXXXXX`), divisions in the address and Dhaka time.

| Option | How it works | Saved with the order | Payment status |
| --- | --- | --- | --- |
| Cash on Delivery | Pay the delivery person | — | `pending` |
| bKash / Nagad / Rocket | "Send Money" to the demo merchant number, then enter wallet number + TrxID | last 4 digits of wallet number, TrxID | `paid_demo` |
| Card | Visa / Mastercard / Amex form with live card preview (Luhn check) | last 4 digits only | `paid_demo` |
| Bank transfer | Transfer to the demo bank account, enter the reference number | reference number | `paid_demo` |

- **No real financial transaction occurs** — no payment gateway is connected and the merchant
  numbers / bank account are fake demo values.
- Card number, expiry, CVV, PIN and OTP are **never** sent to the server or stored.
- Test card: `4242 4242 4242 4242`, any future expiry (e.g. `12/30`), any 3-digit CVV.
- Test bKash/Nagad/Rocket: any valid BD number (e.g. `01712345678`) and any TrxID (e.g. `9BC4D7E2F1`).

## Security

- **Row Level Security** on every table: anyone can read products; only admins can change
  products, read all orders and update order status; customers only see their own orders.
- **Orders are priced by the database.** The browser sends only product IDs and quantities to
  the `place_order()` database function, which reads the real prices and calculates the total.
- **Admin checks on the server** in every admin page and every admin Server Action, with RLS as
  the final protection.
- `GEMINI_API_KEY` is server-only (no `NEXT_PUBLIC_` prefix). No Supabase service-role key is used.
- `.env.local` is git-ignored; `.env.example` only contains placeholders.

## Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel: **Add New → Project**, import the repository (framework: Next.js).
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `GEMINI_API_KEY`.
4. Deploy.
5. In Supabase → **Authentication → URL Configuration**, set **Site URL** to your Vercel URL and
   add `https://YOUR-APP.vercel.app/**` to **Redirect URLs** (needed for email confirmation links).

## Project Limitations

- Single vendor only.
- Demo payments only — bKash, Nagad, Rocket, card and bank transfer are simulated (no gateway).
- Bangladesh only (BD mobile numbers and divisions).
- Basic stock management: stock is edited by the admin; out-of-stock products cannot be ordered,
  but stock is not reduced automatically when an order is placed.
- AI recognition depends on the model output and photo quality.
- University / demo project — no rate limiting on the image search API, no email notifications.
