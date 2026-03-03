-- Ejecutar en Supabase SQL Editor si orders ya existe sin estas columnas:

alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists phone text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists shipping_address text;

-- Si profiles no tiene email:
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists updated_at timestamptz default now();
