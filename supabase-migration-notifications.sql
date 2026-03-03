-- Migración: stock al confirmar + estado Confirmado
-- Ejecutar en Supabase SQL Editor

-- Trigger: descuento de stock solo cuando el pedido pasa a 'confirmed'
create or replace function public.decrement_stock_after_paid()
returns trigger as $$
begin
  if (tg_op = 'UPDATE')
     and (old.status is distinct from 'confirmed')
     and (new.status = 'confirmed') then

    update public.products p
    set stock = p.stock - oi.quantity
    from public.order_items oi
    where oi.order_id = new.id
      and oi.product_id = p.id;

  end if;

  return new;
end;
$$ language plpgsql;

-- El trigger ya existe, solo actualizamos la función (no hace falta recrear el trigger).
