-- Task 1: ImgBB upload tracking.
-- Creates the uploads table and adds optional provider/upload-id columns to
-- products, galleries, and categories. All additive + idempotent; external
-- image URLs keep working because the new columns are nullable.

create table if not exists "beary"."uploads" (
  "id" uuid primary key default gen_random_uuid(),
  "provider" text not null default 'imgbb',
  "upload_id" text not null,
  "image_url" text not null,
  "display_url" text,
  "thumb_url" text,
  "delete_url" text,
  "mime" text,
  "width" integer,
  "height" integer,
  "size_bytes" integer,
  "original_name" text,
  "created_at" timestamptz not null default now()
);
create index if not exists "uploads_provider_id_idx" on "beary"."uploads" ("provider", "upload_id");
create index if not exists "uploads_created_idx" on "beary"."uploads" ("created_at" desc);

alter table "beary"."products"          add column if not exists "image_provider"  text;
alter table "beary"."products"          add column if not exists "image_upload_id" text;
alter table "beary"."product_galleries" add column if not exists "image_provider"  text;
alter table "beary"."product_galleries" add column if not exists "image_upload_id" text;
alter table "beary"."categories"        add column if not exists "image_provider"  text;
alter table "beary"."categories"        add column if not exists "image_upload_id" text;

-- Grants + RLS mirroring drizzle/0000_init.sql (public publishable-key access;
-- admin is gated at the server-action layer).
grant usage on schema "beary" to anon, authenticated, service_role;
grant all on all tables in schema "beary" to anon, authenticated, service_role;
grant all on all sequences in schema "beary" to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on tables to anon, authenticated, service_role;
alter default privileges in schema "beary" grant all on sequences to anon, authenticated, service_role;

alter table "beary"."uploads" enable row level security;

drop policy if exists "public full access on uploads" on "beary"."uploads";
create policy "public full access on uploads"
  on "beary"."uploads" for all to anon, authenticated using (true) with check (true);
