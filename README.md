# 🧸 Beary Baby App

Beary Baby is a simple, mobile-first product catalog app for a small baby-products shop. It is designed to be shown to customers in person — browse categories, search products, and view product details with photo galleries. It is **not** an online store: there is no cart, checkout, or customer accounts. Just a beautiful catalog backed by a simple admin panel.

## Features

### Customer-facing
- **Home page** — engaging hero, category grid, and featured products
- **Products page** — card list with main image, name, and price in Philippine Pesos (₱)
  - Filter by category, name, and price range
  - Sort by name, price, or category (A→Z and reverse)
  - "Load more" pagination (never shows all products at once)
- **Product detail page** — main picture, name, price, description, and a photo gallery carousel
  - Shows other products from the same categories in random order
- **Search** — flexible, case-insensitive partial match on product name and description
- **Out-of-stock handling** — products with `Available = false` or `Stocks = 0` are pushed to the bottom with an "Out of stock" badge; `Stocks = NULL` behaves normally
- **Price display** — products with `DisplayPrice = false` show "Price on inquiry" instead
- All catalog state (filters, sort, search) lives in URL query parameters — shareable and bookmarkable

### Admin
- **Login** at `/login` using environment-based credentials (no customer accounts)
- **Products CRUD** — create/edit/delete products with:
  - Slug auto-derived from the name on create (stays unchanged on rename)
  - Unique slug and product code validation
  - Main image + gallery image URLs (paste external URLs, e.g. from imgbb)
  - Multiple categories per product
- **Categories CRUD** — with ordering; deleting a category moves its products to uncategorized
- **Featured products** — pick and order products shown on the home page
- **CSV batch import** — skip rows whose product code already exists

## Tech Stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components)    |
| Styling    | Tailwind CSS 4 + DaisyUI 5 (pink theme)       |
| Database   | Supabase PostgreSQL (schema: `beary`)         |
| Data access| `@supabase/supabase-js` (server-side only)    |
| Auth       | iron-session (encrypted cookie, env credentials) |
| Package mgr| Bun                                           |
| Hosting    | Vercel                                        |

### Architecture

```
src/
├── app/                  # Routes (customer + admin pages, server actions)
├── application/          # ProductService, CategoryService, ImportService
├── domain/               # Product, Category types + business rules
├── components/           # Header, ProductCard, filters, carousel, admin forms
└── infrastructure/
    ├── supabase/         # Supabase client + row types
    └── auth/             # Admin session (iron-session)
```

- **Server Components by default**; Client Components only where interaction is needed (search, filters, carousel, forms)
- **Server Actions** for all mutations (no REST API)
- Catalog reads are cached with `use cache` + `cacheTag("catalog")` and invalidated via `revalidateTag` after admin changes

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration SQL: open [`drizzle/0000_init.sql`](drizzle/0000_init.sql) and paste it into the Supabase **SQL Editor**, then run it. This creates the `beary` schema and all tables.
3. Gather your credentials (see env fields below)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Then fill in the values (see [Environment Variables](#environment-variables)).

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Customer catalog: `/` and `/products`
- Admin: log in at `/login` with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`, then manage at `/admin`

### 5. Production build

```bash
bun run build
bun run start
```

> The build prerenders catalog pages against the database, so a working `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` is required for `bun run build` to succeed.

## Environment Variables

All variables live in `.env.local` (local) or your hosting provider's env settings (production). See [`.env.example`](.env.example) for a template.

| Variable                   | Required | Description |
| -------------------------- | -------- | ----------- |
| `SUPABASE_URL`             | ✅       | Your Supabase **Project URL**, e.g. `https://abcdefgh.supabase.co`. Found in *Project Settings → API → Project URL*. This is the REST endpoint the app queries. |
| `SUPABASE_PUBLISHABLE_KEY` | ✅       | Your Supabase **publishable key**. Found in *Project Settings → API → publishable key*. Safe for public use — data access is governed by Row Level Security policies (see [`drizzle/0000_init.sql`](drizzle/0000_init.sql)). |
| `DB_SCHEMA`                | —        | The PostgreSQL schema namespace the app reads/writes. Defaults to `beary`. If you change it, also run the migration with that schema name (see the header of [`drizzle/0000_init.sql`](drizzle/0000_init.sql)). |
| `ADMIN_USERNAME`           | ✅       | Username for the admin login at `/login`. Only used to gate the admin panel — there are no customer accounts. |
| `ADMIN_PASSWORD`           | ✅       | Password for the admin login. Choose something strong; this is the only gate to your product data. |
| `SESSION_PASSWORD`         | ✅       | Encryption key for the admin session cookie (iron-session). **Must be at least 32 characters long.** Use a long random string, e.g. `openssl rand -base64 32`. |

> **Note:** the app also accepts `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` as fallbacks. The publishable key is safe to use since all data access is governed by RLS policies.

## CSV Import Format

Paste CSV into *Admin → Import CSV*. Headers (first row):

```csv
name,code,description,price,available,stocks,imageUrl,displayPrice,categories
Teddy Bear Small,BB-001,"Soft brown teddy",299,true,10,https://i.ibb.co/x.png,true,Bears
```

- `name`, `code`, `price` are required
- `code` must be unique — rows with an existing code are **skipped**
- `categories` is a comma-separated list of **existing** category names
- `available` / `displayPrice` accept `true`/`false` (default `true`)
- `stocks` empty = unlimited (behaves normally)

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add all env variables from the table above in *Project Settings → Environment Variables*
4. Deploy

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)
