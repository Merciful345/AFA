create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_path text,
  point_cost integer not null check (point_cost > 0),
  stock integer not null check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references public.voters(id) on delete cascade,
  reward_id uuid not null references public.rewards(id),
  reward_name text not null,
  points_spent integer not null,
  status text not null default 'pending' check (status in ('pending', 'delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger rewards_set_updated_at before update on public.rewards
  for each row execute function public.set_updated_at();
create trigger redemptions_set_updated_at before update on public.redemptions
  for each row execute function public.set_updated_at();

alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reward-images', 'reward-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Canje atómico: valida stock y puntos, descuenta los dos, y deja registro
-- en redemptions. El "for update" evita que dos canjes simultáneos se
-- lleven la última unidad de stock o dejen puntos negativos.
create or replace function public.redeem_reward(p_voter_id uuid, p_reward_id uuid)
returns uuid
language plpgsql
as $$
declare
  v_reward public.rewards;
  v_voter public.voters;
  v_redemption_id uuid;
begin
  select * into v_reward from public.rewards where id = p_reward_id for update;
  if v_reward is null or not v_reward.active then
    raise exception 'Premio no disponible';
  end if;
  if v_reward.stock <= 0 then
    raise exception 'Sin stock';
  end if;

  select * into v_voter from public.voters where id = p_voter_id for update;
  if v_voter is null then
    raise exception 'Votante no encontrado';
  end if;
  if v_voter.points < v_reward.point_cost then
    raise exception 'No tenés puntos suficientes';
  end if;

  update public.rewards set stock = stock - 1 where id = p_reward_id;
  update public.voters set points = points - v_reward.point_cost where id = p_voter_id;

  insert into public.redemptions (voter_id, reward_id, reward_name, points_spent)
  values (p_voter_id, p_reward_id, v_reward.name, v_reward.point_cost)
  returning id into v_redemption_id;

  return v_redemption_id;
end;
$$;
