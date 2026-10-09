-- Task 4: Product variants.
-- Adds product_variants, a cached price_range on products, and (if the orders
-- tables from 0003 exist) the FK on order_items.variant_id. Additive + idempotent.

alter table "beary"."products" add column if not exists "price_range" text;

create table if not exists "beary"."product_variants" (
  "id" uuid primary key default gen_random_uuid(),
  "product_id" uuid not null references "beary"."products" ("id") on delete cascade,
  "label" text not null,
  "sku" text,
  "price" double precision,
  "stocks" integer,
  "available" boolean not null default true,
  "order" integer not null default 0,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index if not exists "product_variants_product_idx" on "beary"."product_variants" ("product_id", "order");
create unique index if not exists "product_variants_sku_unique"
  on "beary"."product_variants" ("product_id", "sku") where "sku" is not null;

-- Requires 0003 to have created order_items.variant_id (uuid, no FK).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'beary' and table_name = 'order_items'
  ) and not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'beary' and constraint_name = 'order_items_variant_fk'
  ) then
    alter table "beary"."order_items"
      add constraint "order_items_variant_fk"
      foreign key ("variant_id") references "beary"."product_variants" ("id") on delete set null;
  end if;
end $$;

-- Grants + RLS: product_variants mirrors 0000_init.sql.
grant usage on schema "beary" to anon, authenticated, service_role;
grant all on all tables in schema "beary" to anon, authenticated, service_role;
grant all on all sequences in schema "beary" to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on tables to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on sequences to anon, authenticated, service_role;

alter table "beary"."product_variants" enable row level security;

drop policy if exists "public full access on product_variants" on "beary"."product_variants";
create policy "public full access on product_variants"
  on "beary"."product_variants" for all to anon, authenticated using (true) with check (true);
