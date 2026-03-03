-- 1) Número de orden corto (8 dígitos)
-- Ejecutar en Supabase SQL Editor

alter table public.orders add column if not exists order_number integer unique;

create sequence if not exists public.order_number_seq start 10000000;

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

-- Opcional: rellenar order_number en órdenes existentes (ejecutar una vez)
-- update public.orders set order_number = nextval('public.order_number_seq') where order_number is null;

-- 2) Descontar stock al crear la compra (al insertar order_items)
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

-- 3) Quitar el descuento de stock al pasar a "Confirmado" (ya no se usa)
drop trigger if exists trg_decrement_stock_after_paid on public.orders;

-- 4) Crear perfil cuando un usuario se registra (opcional)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'customer'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
