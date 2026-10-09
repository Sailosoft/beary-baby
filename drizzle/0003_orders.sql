-- Task 3: Orders (fire-and-forget MVP).
-- orders + order_items persisted to Supabase so the vendor can track them;
-- the customer's local cart/history lives in Dexie. Additive + idempotent.

create table if not exists "beary"."orders" (
  "id" uuid primary key default gen_random_uuid(),
  "customer_name" text not null,
  "note" text,
  "status" text not null default 'new',
  "total" double precision not null default 0,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index if not exists "orders_customer_name_idx" on "beary"."orders" (lower("customer_name"));
create index if not exists "orders_status_idx" on "beary"."orders" ("status");

create table if not exists "beary"."order_items" (
  "id" uuid primary key default gen_random_uuid(),
  "order_id" uuid not null references "beary"."orders" ("id") on delete cascade,
  "product_id" uuid references "beary"."products" ("id") on delete set null,
  "variant_id" uuid,
  "product_name" text not null,
  "variant_label" text,
  "unit_price" double precision not null,
  "quantity" integer not null default 1,
  "note" text,
  "created_at" timestamptz not null default now()
);
create index if not exists "order_items_order_idx" on "beary"."order_items" ("order_id");

-- Grants + RLS for orders/order_items mirroring 0000_init.sql.
-- NOTE: under the open-RLS model these tables are publicly readable/writable
-- with the publishable key. Acceptable for this fire-and-forget MVP; harden
-- later with an insert-only policy backed by a service-role key.
grant usage on schema "beary" to anon, authenticated, service_role;
grant all on all tables in schema "beary" to anon, authenticated, service_role;
grant all on all sequences in schema "beary" to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on tables to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on sequences to anon, authenticated, service_role;

alter table "beary"."orders" enable row level security;
alter table "beary"."order_items" enable row level security;

drop policy if exists "public full access on orders" on "beary"."orders";
create policy "public full access on orders"
  on "beary"."orders" for all to anon, authenticated using (true) with check (true);

drop policy if exists "public full access on order_items" on "beary"."order_items";
create policy "public full access on order_items"
  on "beary"."order_items" for all to anon, authenticated using (true) with check (true);
