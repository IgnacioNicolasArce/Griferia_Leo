-- Crear tabla profiles (ejecutar en Supabase SQL Editor si no existe)

do $$ begin
  create type public.user_role as enum ('admin', 'customer');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
