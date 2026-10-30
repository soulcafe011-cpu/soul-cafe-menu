# Soul Café — Digital Menu MVP

A responsive Arabic-first café menu with product categories, search, shopping cart, and a WhatsApp checkout message. This initial version uses demo menu data so the visual experience runs before a database is configured.

## Included
- Responsive Arabic RTL menu and café landing page
- Category tabs and search
- Product cards with photos, descriptions, and prices
- Shopping cart with quantity controls
- Optional customer name, order type, and note
- WhatsApp checkout message containing item names, quantities, prices, and total
- Supabase-backed public menu loading when configured
- Owner login and basic admin CRUD for products and categories
- Image upload support via Supabase Storage
- Starter Supabase schema and RLS policies for categories, products, orders, and order items
- `.env.example` for environment configuration

## Requirements
- Node.js 20.9+ recommended
- npm
- A Supabase project for live menu data/admin
- A public website URL before printing final QR codes

## Run locally
1. Install Node.js from https://nodejs.org/
2. Extract this project.
3. Open a terminal in the project folder.
4. Run:
   ```bash
   npm install
   ```
5. Copy `.env.example` to `.env.local`.
6. Set `NEXT_PUBLIC_CAFE_WHATSAPP` to the café number in international format using digits only, e.g. `9639XXXXXXXX`. Do not include `+`, spaces, or hyphens.
7. Set `NEXT_PUBLIC_CURRENCY` to the correct currency label.
8. Run:
   ```bash
   npm run dev
   ```
9. Open http://localhost:3000

## Important current MVP limitations
- Without Supabase environment variables, the storefront uses sample products and the admin dashboard cannot authenticate. With Supabase configured, the storefront reads menu data from the database and the admin dashboard supports product CRUD, category creation, and image uploads.
- WhatsApp checkout opens WhatsApp with a pre-filled message. The customer must press Send. A website cannot silently send WhatsApp messages to a normal WhatsApp number. Automated sending requires an approved WhatsApp Business Platform integration.
- Prices and currency in the demo are sample values. Replace them before publishing.
- The cafe's actual WhatsApp number is not included; configure it in `.env.local`.
- Do not deploy until database access policies and owner-only write access have been implemented and tested.

## Supabase setup
1. Create a Supabase project owned by the café owner.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication > Users, create the owner's user with email and password.
4. Copy the owner's auth user UUID and run `insert into public.cafe_admins (user_id) values ('OWNER-USER-UUID-HERE');` after replacing the placeholder.
5. In Storage, create a public bucket named `menu-images` (the SQL policies expect this bucket).
6. Add environment variables from Project Settings → API to `.env.local`.
7. The SQL file provides owner-only write policies for categories/products. Order storage is not wired into checkout in this MVP; checkout currently sends the order through WhatsApp.

## Production checklist
- Replace sample products/prices/photos and verify image rights.
- Add secure owner login and an admin dashboard.
- Connect products/categories to Supabase.
- Implement server-side order creation with server-calculated totals and input validation.
- Add order notification strategy.
- Configure storage upload policies.
- Test RLS with both anonymous and owner accounts.
- Configure domain and HTTPS.
- Generate QR codes only after the final domain is active.
- Transfer GitHub repository, Supabase project, domain, and hosting ownership to the café owner.

## Ownership
For clean handover, create GitHub, Supabase, domain registrar, and hosting accounts under the café owner's email. If initially created under the developer's account, transfer ownership and rotate credentials before sign-off.
