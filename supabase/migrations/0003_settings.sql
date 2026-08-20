create table public.settings (
  id integer primary key default 1 check (id = 1),
  registration_fee integer not null check (registration_fee > 0),
  prize_mode text not null default 'dynamic' check (prize_mode in ('dynamic', 'fixed')),
  house_cut_percentage numeric(7,4) not null default 0 check (house_cut_percentage between 0 and 100),
  first_place_share numeric(7,4) not null default 0 check (first_place_share between 0 and 100),
  fixed_first_prize integer not null default 0 check (fixed_first_prize >= 0),
  fixed_second_prize integer not null default 0 check (fixed_second_prize >= 0),
  updated_at timestamptz not null default now()
);

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

-- Mismo patrón default-deny que registrations: RLS activado sin policies,
-- solo el service_role (server-only, en ambas apps) puede leer/escribir.
alter table public.settings enable row level security;

insert into public.settings (
  id, registration_fee, prize_mode, house_cut_percentage, first_place_share,
  fixed_first_prize, fixed_second_prize
) values (
  1, 50, 'dynamic', 88.3333, 71.4286, 250, 100
);
