-- Task 2: Pre-order flag on products.
-- Additive + idempotent; existing rows backfill to false via the default.

alter table "beary"."products"
  add column if not exists "is_preorder" boolean not null default false;
