-- Supabase / PostgreSQL schema for Uncle Khan's MiniMart
-- Creates `categories` and `products` tables used by the POS app

-- Run this in the Supabase SQL editor or with the psql/Supabase CLI.

create table if not exists categories (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric(10,2) not null default 0,
  image text,
  category text references categories(id) on delete set null,
  barcode text unique,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_barcode on products(barcode);

-- Example: Insert initial categories (optional)
-- insert into categories (id, name) values
--  ('snacks', 'Snacks & Chips'),
--  ('beverages', 'Beverages'),
--  ('groceries', 'Groceries'),
--  ('household', 'Household & Toiletries');
