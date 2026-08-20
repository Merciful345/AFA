create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  instagram text,
  email text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'rejected', 'cancelled')),
  amount integer not null default 3000,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index registrations_status_idx on public.registrations (status);
create index registrations_mp_payment_id_idx on public.registrations (mp_payment_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

-- RLS activado sin policies = default-deny para los roles anon/authenticated.
-- El service_role key (usado solo en src/lib/supabase.ts, server-only) siempre
-- bypassea RLS. Este proyecto nunca crea un cliente de Supabase en el browser
-- para esta tabla, así que el único camino de lectura/escritura son nuestras
-- propias API routes.
alter table public.registrations enable row level security;
