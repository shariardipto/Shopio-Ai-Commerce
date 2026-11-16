STEP A — Core Shopio + Supabase + Customer Side

You are building a university project named:

SHOPIO — AI-Powered Single-Vendor E-commerce Web Application

This is a small but complete university project.

IMPORTANT:
This is STEP A of a 3-step build.

In STEP A build only:

- Next.js project foundation
- Supabase connection
- Database schema
- Authentication
- Customer-facing product browsing
- Text search
- Category filtering
- Product details
- Shopping cart

Do NOT build:
- admin UI
- checkout
- orders UI
- payment
- Gemini AI
- image search

Those come in later steps.

==================================================
1. TECHNOLOGY STACK
==================================================

Use:

- Next.js with App Router
- React
- JavaScript, NOT TypeScript
- Tailwind CSS
- Supabase
- @supabase/supabase-js
- @supabase/ssr
- Browser localStorage for cart
- npm

Do not use:
- Redux
- Zustand
- Firebase
- Prisma
- separate Express backend
- unnecessary libraries

Keep the code simple enough for a university student to explain in a viva.

==================================================
2. PROJECT SETUP
==================================================

If no project exists, create a Next.js project named:

shopio

Use:

- JavaScript
- App Router
- Tailwind CSS
- src directory

If an existing Next.js project exists, continue inside it.

Install the required current Supabase packages.

Follow the CURRENT official Supabase SSR pattern for Next.js App Router.

Create separate Supabase browser and server clients.

Do not use deprecated Supabase auth helpers.

==================================================
3. ENVIRONMENT VARIABLES
==================================================

Create:

.env.example

with:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key

Gemini will not be used until STEP C.

Never commit real secrets.

Make sure .env.local is gitignored.

==================================================
4. DATABASE SCHEMA
==================================================

Create:

supabase/schema.sql

The SQL file must be complete and runnable inside Supabase SQL Editor.

Create these tables:

profiles
products
orders
order_items

--------------------------------------------------
profiles
--------------------------------------------------

Fields:

id UUID primary key referencing auth.users(id)
full_name text
email text
role text default 'customer'
created_at timestamp

Allowed roles:

customer
admin

Create a trigger so whenever a Supabase Auth user signs up,
a matching profiles record is automatically created.

The signup process must NEVER allow a normal user to choose
the admin role.

Admin role will only be assigned manually in Supabase.

--------------------------------------------------
products
--------------------------------------------------

Fields:

id UUID primary key
name text not null
description text
price numeric not null
category text not null
keywords text array
image_url text
stock integer default 0
created_at timestamp
updated_at timestamp

--------------------------------------------------
orders
--------------------------------------------------

Fields:

id UUID primary key
user_id UUID referencing profiles(id)
full_name text
email text
phone text
address text
subtotal numeric
shipping_fee numeric
total numeric
payment_method text
payment_status text
order_status text
created_at timestamp

Default order_status:

pending

--------------------------------------------------
order_items
--------------------------------------------------

Fields:

id UUID primary key
order_id UUID referencing orders(id)
product_id UUID referencing products(id)
product_name text
price numeric
quantity integer

==================================================
5. ROW LEVEL SECURITY
==================================================

Enable RLS.

Create secure policies.

Products:

- anyone can read products
- only admin users can insert products
- only admin users can update products
- only admin users can delete products

Profiles:

- users can read/update their own profile
- admins can access profiles when necessary

Orders:

- authenticated customers can create their own orders
- customers can only read their own orders
- admins can read all orders
- admins can update order status

Order items:

- users can access items belonging to their own orders
- admins can access all order items

Use a safe helper function such as is_admin() if needed.

Avoid recursive RLS problems.

==================================================
6. STORAGE
==================================================

Prepare Supabase Storage for future admin product image uploads.

Create/use a public bucket named:

product-images

Public users should be able to read product images.

Only admin users should be able to upload/update/delete product images.

Include the required storage SQL/policies in schema.sql if practical,
or document the exact one-time Supabase dashboard setup.

==================================================
7. SEED PRODUCTS
==================================================

Create:

supabase/seed.sql

Add around 12 demo products.

Use categories useful for AI image search later.

Examples:

Blue Ballpoint Pen
Black Gel Pen
HB Pencil
Notebook
Drawing Book
Eraser
Wireless Mouse
Keyboard
Laptop
Backpack
Running Shoes
Water Bottle

Include useful keywords.

Example:

name:
Blue Ballpoint Pen

category:
Stationery

keywords:
pen, ballpoint, writing, stationery

Use BDT pricing.

If actual product images are unavailable, use clean local placeholder
images or suitable stable placeholders for STEP A.

==================================================
8. AUTHENTICATION
==================================================

Create:

/login
/signup

Use Supabase email/password authentication.

Signup form:

Full Name
Email
Password
Confirm Password

Login form:

Email
Password

Implement:

- signup
- login
- logout
- persistent auth session
- readable error messages

Navbar should react to authentication state.

Logged out:

Login
Sign Up

Logged in:

user name/email
Logout

Browsing products should NOT require login.

==================================================
9. HOME PAGE
==================================================

Create:

/

Responsive WEB application.

Do not make it look like a mobile-only app.

Navbar:

SHOPIO
Home
Search
Cart
Login/account area

Main hero:

"Find What You're Looking For"

Subtitle:

"Search and discover products easily with Shopio."

Main product search bar.

Category filters:

All
Stationery
Electronics
Fashion
Accessories

Product grid:

Desktop:
approximately 4 cards

Tablet:
2–3 cards

Mobile:
1–2 cards

Products must come from Supabase database.

Do NOT use static products.js as the primary product source.

==================================================
10. TEXT SEARCH
==================================================

Implement working text search.

Search:

product name
category
keywords

Search must be:

- case insensitive
- whitespace tolerant
- easy to understand

Examples:

pen

should find relevant pen products.

mouse

should find Wireless Mouse.

Category filter and search should work together.

If nothing matches:

"No products found."

==================================================
11. PRODUCT CARD
==================================================

Create reusable:

ProductCard.jsx

Show:

product image
name
category
price
View Details
Add to Cart

Use:

৳

for currency.

==================================================
12. PRODUCT DETAILS
==================================================

Create:

/product/[id]

Load product from Supabase.

Display:

large image
name
category
price
stock
description
Add to Cart

Handle invalid product IDs cleanly.

==================================================
13. CART
==================================================

Create:

/cart

Use localStorage.

Do NOT store cart in database.

Cart item:

image
name
price
quantity

Controls:

+
-
Remove

If same product is added again:

increase quantity

Do not let quantity fall below 1.

Show navbar cart item count.

Calculate:

subtotal

Do not implement checkout yet.

Show a disabled/future or normal button:

Proceed to Checkout

The route will be implemented in STEP B.

Empty state:

"Your cart is empty."

==================================================
14. REUSABLE COMPONENTS
==================================================

Keep components limited and useful.

Suggested:

Navbar.jsx
ProductCard.jsx
SearchBar.jsx
CartItem.jsx

Do not create an unnecessarily complicated component architecture.

==================================================
15. DATABASE SETUP DOCUMENTATION
==================================================

Create:

SUPABASE_SETUP.md

Explain exactly:

1. Create Supabase project.
2. Copy project URL.
3. Copy publishable key.
4. Add them to .env.local.
5. Run supabase/schema.sql in SQL Editor.
6. Run supabase/seed.sql.
7. Create a normal account.
8. Explain that STEP B will promote one account to admin.

Do NOT require the Supabase service-role secret in the browser.

==================================================
16. STEP A ACCEPTANCE TEST
==================================================

Before finishing verify:

Homepage works.

Products load from Supabase.

Signup works.

Login works.

Logout works.

Text search works.

Category filtering works.

Product details work.

Add to Cart works.

Cart survives browser refresh.

Cart quantity/remove work.

No major console errors.

No secrets committed.

npm run build succeeds.

Fix problems before finishing.

At the end give me:

STEP A COMPLETE

Then summarize:

routes created
database tables created
environment variables
manual Supabase setup still required

Do NOT proceed to STEP B.



STEP B — Admin Portal + Checkout + Orders + Payment

Continue the EXISTING Shopio project from STEP A.

Do NOT create a new project.
Do NOT replace working STEP A code unnecessarily.

STEP A already contains:

- Next.js
- Supabase
- authentication
- profiles
- products
- orders
- order_items
- product browsing
- text search
- categories
- product details
- localStorage cart

This is STEP B.

Implement:

ADMIN PORTAL
PRODUCT MANAGEMENT
CHECKOUT
COD
DEMO CARD PAYMENT
ORDER CREATION
CUSTOMER ORDERS
ADMIN ORDER MANAGEMENT

Do NOT implement Gemini AI yet.

==================================================
1. ADMIN ROLE
==================================================

Use:

profiles.role

Possible values:

customer
admin

Create secure server-side authorization.

Normal customers must NOT be able to access:

/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders

Do not rely only on hiding buttons.

Verify admin authorization on the server where appropriate.

If non-admin accesses /admin:

redirect or show Access Denied.

Add documentation explaining how to promote an existing user.

Example concept:

update public.profiles
set role = 'admin'
where email = 'ADMIN_EMAIL';

Do not hard-code an actual admin email.

==================================================
2. ADMIN DASHBOARD
==================================================

Create:

/admin

Simple university-project dashboard.

Show:

Shopio Admin

Total Products
Total Orders
Pending Orders

Actions:

Manage Products
View Orders
Go to Store

Do not add charts or complex analytics.

==================================================
3. ADMIN PRODUCT MANAGEMENT
==================================================

Create:

/admin/products

Show products in a simple responsive table/list.

Fields:

image
name
category
price
stock

Actions:

Edit
Delete

Button:

Add Product

==================================================
4. ADD PRODUCT
==================================================

Create:

/admin/products/new

Form:

Product Name
Category
Price
Stock
Description
Keywords
Product Image

Upload image to Supabase Storage bucket:

product-images

Store returned public image URL in:

products.image_url

Keywords can be entered as comma-separated text and converted into
the database text array.

Validate required fields.

After success:

redirect to /admin/products

Show clear success/error feedback.

==================================================
5. EDIT PRODUCT
==================================================

Create:

/admin/products/[id]/edit

Load existing product.

Allow:

name edit
category edit
price edit
stock edit
description edit
keywords edit
image replacement

Save to Supabase.

==================================================
6. DELETE PRODUCT
==================================================

Admin can delete product.

Require a simple confirmation before deletion.

Do not allow customers to call product delete operations successfully.

RLS must remain the final protection.

==================================================
7. CHECKOUT
==================================================

Create:

/checkout

Checkout requires authenticated customer.

If logged-out user tries to checkout:

redirect to login

and make returning to checkout reasonably easy after login if practical.

Checkout form:

Full Name
Email
Phone Number
Delivery Address

Pre-fill name/email from authenticated profile when possible.

Show:

Order Summary

Products
Subtotal
Shipping Fee
Total

Fixed shipping:

৳80

==================================================
8. PAYMENT METHODS
==================================================

Provide exactly two options:

Cash on Delivery
Card Payment

--------------------------------------------------
CASH ON DELIVERY
--------------------------------------------------

If COD:

payment_method = "cod"
payment_status = "pending"

No payment processing.

--------------------------------------------------
DEMO CARD PAYMENT
--------------------------------------------------

This is ONLY A DEMONSTRATION.

Do not connect Stripe or any real payment gateway.

If Card is selected show:

Cardholder Name
Card Number
Expiry
CVV

Do simple frontend validation only.

Example acceptable demo card format:

4242 4242 4242 4242

Do NOT store:

full card number
CVV
expiry

in Supabase.

At most store:

payment_method = "card"
payment_status = "paid_demo"
card_last4 if genuinely useful

Clearly display:

"Demo payment only — no real transaction will be processed."

==================================================
9. CREATE ORDER
==================================================

When Place Order is clicked:

Require authenticated user.

Do not blindly trust prices sent by the browser.

Use server-side logic / Route Handler / Server Action as appropriate.

Retrieve current product prices from Supabase.

Calculate:

subtotal

shipping_fee = 80

total

Create record in:

orders

Then create records in:

order_items

Include:

product ID
product name snapshot
price snapshot
quantity

For COD:

payment_status = pending

For Demo Card:

payment_status = paid_demo

Initial:

order_status = pending

After order succeeds:

clear localStorage cart

redirect:

/order-success

==================================================
10. ORDER SUCCESS
==================================================

Create:

/order-success

Display:

✓

Order Placed Successfully

Thank you for shopping with Shopio.

Buttons:

View My Orders
Continue Shopping

==================================================
11. CUSTOMER MY ORDERS
==================================================

Create:

/my-orders

Authentication required.

Only show current user's orders.

Show:

Order ID short format
Date
Total
Payment Method
Payment Status
Order Status

Optionally show order items in a simple expandable section or details area.

No complicated tracking.

==================================================
12. ADMIN ORDERS
==================================================

Create:

/admin/orders

Admin can see all orders.

Display:

order ID
customer
date
total
payment method
payment status
order status

Admin should be able to update order status:

pending
processing
completed
cancelled

Keep it simple.

Do not build real shipping/tracking.

==================================================
13. NAVIGATION
==================================================

Customer navbar should contain appropriate:

Home
Cart
My Orders
Account/Login

If current user is admin also display:

Admin

Do not display Admin navigation to normal customers.

==================================================
14. STOCK
==================================================

Keep stock handling simple.

Show:

In Stock
or
Out of Stock

If stock <= 0:

disable Add to Cart.

Do NOT build advanced stock reservations.

For this university project it is sufficient to maintain the stock value
through the admin product editor.

==================================================
15. SECURITY
==================================================

Audit:

admin pages
admin mutations
orders
product CRUD

Normal customer must not become admin from browser input.

Never expose any Supabase privileged secret.

Use Supabase Auth + RLS.

Do not store raw card data.

==================================================
16. STEP B ACCEPTANCE TEST
==================================================

Verify:

Existing STEP A features still work.

Admin route protection works.

Admin can add product.

Uploaded product image works.

New product appears on storefront.

Admin can edit product.

Admin can delete product.

Customer cannot manage products.

Cart works.

Checkout requires login.

COD order creation works.

Demo card order creation works.

No card number or CVV is stored.

Order appears in My Orders.

Order appears in Admin Orders.

Admin can change order status.

Customer sees updated order status.

Order success page works.

Cart clears after successful order.

npm run build succeeds.

Fix all discovered problems.

At the end output:

STEP B COMPLETE

And summarize:

new routes
admin functionality
checkout
payment demo
order flow

Do NOT start STEP C.




STEP C — Gemini AI Image Search + Final Polish + Vercel

Continue the EXISTING Shopio project from STEP A + STEP B.

Do NOT recreate the project.
Do NOT redesign its architecture.
Do NOT add unnecessary ecommerce features.

This is FINAL STEP C.

The objectives are:

1. Add Gemini AI image-based product search.
2. Add related-product recommendations when exact product is unavailable.
3. Polish the existing UI.
4. Test the entire application.
5. Prepare README.
6. Make the project ready for GitHub and Vercel.

==================================================
1. GEMINI SDK
==================================================

Use the CURRENT official Google Gemini JavaScript SDK:

@google/genai

Use:

GEMINI_API_KEY

as a SERVER-ONLY environment variable.

Never prefix Gemini key with:

NEXT_PUBLIC_

Never expose it to Client Components.

Use a current Gemini model capable of image input:

gemini-2.5-flash-lite

==================================================
2. IMAGE SEARCH ARCHITECTURE
==================================================

Required flow:

Customer Browser
      ↓
Upload Image
      ↓
Next.js Route Handler
      ↓
Gemini API
      ↓
Object + Search Terms
      ↓
Shopio Product Database
      ↓
Exact Products
      ↓
if none
      ↓
Related Products

Gemini should NOT directly invent Shopio products.

Gemini only identifies the object and creates search terms.

The actual displayed products MUST come from Shopio's Supabase products table.

==================================================
3. IMAGE SEARCH API
==================================================

Create:

/api/image-search

Use a Next.js Route Handler.

Accept:

multipart/form-data

Image validation:

image files only
maximum approximately 4 MB

Handle:

missing image
invalid MIME type
large file
Gemini API error
malformed AI response
missing GEMINI_API_KEY

Never crash the application.

==================================================
4. GEMINI PROMPT
==================================================

Send the uploaded image to Gemini.

Prompt concept:

"You are an ecommerce visual product search classifier.

Analyze the uploaded image.

Identify the MAIN purchasable product/object.

Return structured JSON containing:

{
  "object": "simple product name",
  "category": "general ecommerce category",
  "searchTerms": [
    "exact term",
    "alternative term",
    "common term"
  ],
  "relatedTerms": [
    "related product 1",
    "related product 2",
    "related product 3",
    "related product 4"
  ]
}

Rules:

Focus on the primary object.

Use short, simple English ecommerce terms.

Do not invent Shopio inventory.

searchTerms must describe the detected object.

relatedTerms should contain products reasonably related to the detected object.

Return structured JSON only.

Do not return Markdown explanations."

Use Gemini structured JSON output if supported cleanly by the current SDK.

Otherwise safely validate and parse the response.

Normalize returned values before using them.

==================================================
5. IMAGE SEARCH UI
==================================================

Enhance the existing main product search.

Display:

[ Search products... ] [ Image Search / camera icon ]

Clicking Image Search should open a simple modal or panel.

Features:

Select Image
Preview Image
Change Image
Remove Image
Search with AI
Cancel

During processing:

"Analyzing image with AI..."

Disable repeated submit while loading.

==================================================
6. EXACT PRODUCT SEARCH
==================================================

Example:

User uploads an image of a pen.

Gemini returns:

object:
pen

searchTerms:
pen
ballpoint pen
writing pen

Search the CURRENT Supabase products catalog.

Match against:

name
category
keywords

Case insensitive.

Normalize terms.

Prefer exact/object/search-term matches.

If matching products exist display:

AI detected: Pen

Matching Products

[Blue Ballpoint Pen]
[Black Gel Pen]

Do not show unrelated recommendations when exact results exist.

==================================================
7. NO EXACT PRODUCT + RELATED PRODUCTS
==================================================

This is REQUIRED.

Example:

AI identifies:

Pen

but no pen exists in Supabase.

Display:

AI detected: Pen

No Pen Product Found

Related Products

Then use Gemini:

relatedTerms

Example:

pencil
notebook
book
eraser

Search the REAL Shopio Supabase product catalog.

Only show related products that actually exist in database.

Example:

HB Pencil
Notebook
Drawing Book

Do NOT fabricate missing products.

If exact and related searches both find nothing show:

"No matching or related products are currently available."

==================================================
8. TEXT SEARCH MUST REMAIN NORMAL
==================================================

Do not call Gemini for normal text search.

Normal text search should remain:

user text
→ Supabase/local loaded catalog filtering
→ results

Only uploaded images use Gemini.

==================================================
9. AI FAILURE BEHAVIOR
==================================================

If GEMINI_API_KEY is absent:

Display:

"AI image search is not configured."

Do not break:

text search
product browsing
cart
checkout
admin

If Gemini API temporarily fails:

Display:

"Unable to analyze the image right now. Please try again."

==================================================
10. UI FINAL POLISH
==================================================

Audit all customer pages:

Home
Login
Signup
Product Details
Cart
Checkout
Order Success
My Orders

Audit all admin pages:

Admin Dashboard
Products
Add Product
Edit Product
Orders

Keep design:

modern
minimal
clean
responsive

Use consistent:

buttons
inputs
spacing
cards
border radius
typography
loading states
error states

Do not redesign into a huge marketplace.

This is single-vendor Shopio.

==================================================
11. RESPONSIVENESS
==================================================

Ensure:

Desktop:
good 1200px-ish centered layout
4 product cards where appropriate

Tablet:
2–3 product cards

Mobile:
1–2 product cards

No horizontal overflow.

Admin tables should remain usable on smaller screens.

Checkout should remain readable on mobile.

AI modal should fit mobile screens.

==================================================
12. LOADING AND EMPTY STATES
==================================================

Provide clean states for:

Products Loading

No Products Found

Empty Cart

No Orders

AI Analyzing

AI No Exact Product

AI Related Products

AI Error

Product Not Found

Unauthorized Admin Access

==================================================
13. README
==================================================

Create a professional but concise:

README.md

Title:

Shopio — AI-Powered Single-Vendor E-commerce Web Application

Include:

Project Overview

Shopio is a university ecommerce web application where users can browse,
search and purchase products from a single vendor.

The application includes traditional text search and AI-powered visual
product search.

Core Features:

Customer registration/login
Product browsing
Text search
Category filtering
AI image search
Related product recommendation
Product details
Shopping cart
Checkout
Cash on Delivery
Demo card payment
My Orders
Admin dashboard
Product management
Order management

Technology:

React
Next.js
Tailwind CSS
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Google Gemini API
Vercel

Explain visual search:

Image
 ↓
Next.js API
 ↓
Gemini
 ↓
Object/Search Terms
 ↓
Supabase Products
 ↓
Exact Match
 OR
Related Products

Include:

Local Setup

npm install

.env.local:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=

Then:

npm run dev

Include Supabase setup:

run:

supabase/schema.sql
supabase/seed.sql

Explain how to create/promote one admin.

Explain Demo Card:

No real financial transaction occurs.
Raw card information is never stored.

Include project limitations:

single vendor
demo card processing
basic stock management
AI recognition depends on model output
university/demo project

==================================================
14. SECURITY AUDIT
==================================================

Check entire codebase.

Ensure:

GEMINI_API_KEY is server-only.

No Supabase privileged/service-role secret exists in browser code.

No raw card details stored.

Normal users cannot access admin operations.

Product CRUD remains protected by RLS.

Users only access their own orders.

Admin access is verified securely.

.env.local is ignored.

.env.example contains placeholders only.

Remove debug console.logs.

==================================================
15. FINAL COMPLETE USER TEST
==================================================

Test this full customer flow:

Create Account
→ Login
→ Browse Products
→ Search "pen"
→ Product Details
→ Add to Cart
→ Cart
→ Checkout
→ COD
→ Place Order
→ Order Success
→ My Orders

Then test:

Card Demo flow

Then test AI exact search:

Upload a pen image
→ AI detects Pen
→ matching Shopio pen products

Then test AI related search:

Use/test a case where the recognized product is unavailable
→ No [Product] Product Found
→ related products from database

==================================================
16. FINAL ADMIN TEST
==================================================

Admin Login

→ Admin Dashboard

→ Add Product

→ Upload Product Image

→ Product appears on customer homepage

→ Edit Product

→ Product updates on storefront

→ View Orders

→ Change order status

→ Customer sees updated order status

→ Delete a test product

==================================================
17. BUILD AUDIT
==================================================

Run:

npm run build

If lint exists, run the appropriate lint command.

Fix:

build errors
hydration errors
broken imports
route errors
unused critical code
runtime crashes

Do not leave the project in a broken state.

==================================================
18. VERCEL READINESS
==================================================

Prepare for Vercel deployment.

Do not hard-code localhost.

Use relative internal API URLs such as:

/api/image-search

Make sure Supabase works with production URL.

Ensure environment variables required by deployment are documented:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
GEMINI_API_KEY

Gemini key must remain server-only.

Add the production URL to Supabase Auth redirect/site URL configuration if required by the implemented auth flow.

==================================================
19. FINAL ROUTES
==================================================

Final application should remain approximately:

CUSTOMER

/
 /login
 /signup
 /product/[id]
 /cart
 /checkout
 /order-success
 /my-orders

ADMIN

/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders

API

/api/image-search

Do not create many unnecessary pages.

==================================================
20. FINAL RESULT
==================================================

At completion output:

STEP C COMPLETE
SHOPIO PROJECT COMPLETE

Give me:

1. Final routes.
2. Final feature list.
3. Environment variables required.
4. Supabase setup checklist.
5. How to create admin.
6. Local run commands.
7. GitHub commands.
8. Vercel deployment checklist.
9. Any known limitations.

Do NOT add any more features.

The finished project must be small enough for a university submission
while still being a complete working single-vendor ecommerce web app.