-- Esquema de base de datos para Supabase / Postgres
-- Grifería Leo - E-commerce Clean Modern

create type public.user_role as enum ('admin', 'customer');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  type text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  main_image_url text,
  gallery_urls text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 10000000;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer unique,
  user_id uuid references auth.users(id),
  email text,
  customer_name text,
  phone text,
  shipping_address text,
  payment_method text,
  status text not null default 'pending',
  total_amount numeric(10,2) not null,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := nextval('public.order_number_seq');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on public.orders;
create trigger trg_set_order_number
before insert on public.orders
for each row
execute function public.set_order_number();

create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) generated always as (quantity * unit_price) stored
);

-- Trigger: descuento de stock al crear la compra (al insertar cada ítem)
create or replace function public.decrement_stock_on_order_item()
returns trigger as $$
begin
  update public.products
  set stock = greatest(0, stock - new.quantity)
  where id = new.product_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_decrement_stock_on_order_item on public.order_items;
create trigger trg_decrement_stock_on_order_item
after insert on public.order_items
for each row
execute function public.decrement_stock_on_order_item();

-- RLS: permitir lectura pública de productos activos
alter table public.products enable row level security;

create policy "Productos públicos" on public.products
  for select using (is_active = true);

create policy "Admin full access products" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
