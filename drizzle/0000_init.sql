-- Beary Baby initial schema (manual migration)
-- Run against Supabase PostgreSQL. Creates the schema namespace and tables.
-- Pure SQL — safe to paste into the Supabase SQL editor or run via psql.
-- The schema name is hardcoded to "beary" (matches DB_SCHEMA in .env).
-- If you change DB_SCHEMA, update the schema name below accordingly.

CREATE SCHEMA IF NOT EXISTS "beary";

CREATE TABLE IF NOT EXISTS "beary"."categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "image_url" text,
  "order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique" ON "beary"."categories" ("slug");

CREATE TABLE IF NOT EXISTS "beary"."products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL,
  "description" text,
  "price" double precision NOT NULL,
  "available" boolean NOT NULL DEFAULT true,
  "stocks" integer,
  "image_url" text NOT NULL,
  "display_price" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_unique" ON "beary"."products" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "products_code_unique" ON "beary"."products" ("code");
CREATE INDEX IF NOT EXISTS "products_name_idx" ON "beary"."products" ("name");

CREATE TABLE IF NOT EXISTS "beary"."product_categories" (
  "product_id" uuid NOT NULL REFERENCES "beary"."products" ("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "beary"."categories" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_unique" ON "beary"."product_categories" ("product_id", "category_id");
CREATE INDEX IF NOT EXISTS "product_categories_category_idx" ON "beary"."product_categories" ("category_id");

CREATE TABLE IF NOT EXISTS "beary"."product_galleries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "beary"."products" ("id") ON DELETE CASCADE,
  "image_url" text NOT NULL,
  "order" integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "product_galleries_product_idx" ON "beary"."product_galleries" ("product_id", "order");

CREATE TABLE IF NOT EXISTS "beary"."feature_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" integer NOT NULL DEFAULT 0,
  "product_id" uuid NOT NULL REFERENCES "beary"."products" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "feature_products_product_unique" ON "beary"."feature_products" ("product_id");

-- ---------------------------------------------------------------------------
-- API access (publishable key / anon role)
-- The app uses the publishable key, so the anon role needs USAGE on the
-- schema plus privileges on the tables. RLS policies below open the catalog
-- to public reads/writes; the admin panel is gated at the app layer
-- (iron-session server actions), not in the database.
-- ---------------------------------------------------------------------------

grant usage on schema "beary" to anon, authenticated, service_role;
grant all on all tables in schema "beary" to anon, authenticated, service_role;
grant all on all sequences in schema "beary" to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on tables to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on sequences to anon, authenticated, service_role;

alter table "beary"."categories" enable row level security;
alter table "beary"."products" enable row level security;
alter table "beary"."product_categories" enable row level security;
alter table "beary"."product_galleries" enable row level security;
alter table "beary"."feature_products" enable row level security;

create policy "public full access on categories"
  on "beary"."categories" for all to anon, authenticated using (true) with check (true);
create policy "public full access on products"
  on "beary"."products" for all to anon, authenticated using (true) with check (true);
create policy "public full access on product_categories"
  on "beary"."product_categories" for all to anon, authenticated using (true) with check (true);
create policy "public full access on product_galleries"
  on "beary"."product_galleries" for all to anon, authenticated using (true) with check (true);
create policy "public full access on feature_products"
  on "beary"."feature_products" for all to anon, authenticated using (true) with check (true);
