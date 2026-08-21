create table public.matches (
  id uuid primary key default gen_random_uuid(),
  round integer not null check (round >= 1),
  slot integer not null,
  participant_a uuid not null references public.registrations(id),
  participant_b uuid references public.registrations(id),
  winner_id uuid references public.registrations(id),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'complete', 'bye')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (round, slot)
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  game_number integer not null check (game_number in (1, 2, 3)),
  status text not null default 'pending'
    check (status in ('pending', 'submitting', 'voting', 'closed')),
  video_a_path text,
  video_b_path text,
  votes_a integer not null default 0,
  votes_b integer not null default 0,
  winner_side text check (winner_side in ('a', 'b')),
  voting_opened_at timestamptz,
  voting_closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, game_number)
);

create table public.voters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  ip_address text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index voters_ip_address_idx on public.voters (ip_address);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  voter_id uuid not null references public.voters(id) on delete cascade,
  predicted_side text not null check (predicted_side in ('a', 'b')),
  correct boolean,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique (game_id, voter_id)
);
create index predictions_game_id_idx on public.predictions (game_id);

create trigger matches_set_updated_at before update on public.matches
  for each row execute function public.set_updated_at();
create trigger games_set_updated_at before update on public.games
  for each row execute function public.set_updated_at();
create trigger voters_set_updated_at before update on public.voters
  for each row execute function public.set_updated_at();

alter table public.matches enable row level security;
alter table public.games enable row level security;
alter table public.voters enable row level security;
alter table public.predictions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('match-videos', 'match-videos', true, 209715200, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

-- Tallya votos, reparte puntos a los que acertaron, cierra el juego, y
-- decide si el match ya tiene ganador (2 juegos) o hay que abrir el
-- siguiente (juego 2 siempre se crea; juego 3 solo si quedó 1-1). Todo en
-- una transacción para que no quede a mitad de camino ante un error.
create or replace function public.close_game_voting(
  p_game_id uuid,
  p_winner_side text,
  p_points integer
)
returns void
language plpgsql
as $$
declare
  v_game public.games;
  v_match public.matches;
  v_wins_a integer;
  v_wins_b integer;
begin
  select * into v_game from public.games where id = p_game_id for update;
  if v_game is null then
    raise exception 'game not found';
  end if;
  if v_game.status <> 'voting' then
    raise exception 'game is not open for voting (status=%)', v_game.status;
  end if;
  if p_winner_side not in ('a', 'b') then
    raise exception 'invalid winner side';
  end if;

  select * into v_match from public.matches where id = v_game.match_id for update;

  update public.games set
    status = 'closed',
    winner_side = p_winner_side,
    votes_a = (select count(*) from public.predictions where game_id = p_game_id and predicted_side = 'a'),
    votes_b = (select count(*) from public.predictions where game_id = p_game_id and predicted_side = 'b'),
    voting_closed_at = now()
  where id = p_game_id;

  update public.predictions set
    correct = (predicted_side = p_winner_side),
    points_awarded = case when predicted_side = p_winner_side then p_points else 0 end
  where game_id = p_game_id;

  update public.voters v set points = v.points + p_points
  from public.predictions p
  where p.game_id = p_game_id and p.voter_id = v.id and p.predicted_side = p_winner_side;

  select
    count(*) filter (where winner_side = 'a'),
    count(*) filter (where winner_side = 'b')
  into v_wins_a, v_wins_b
  from public.games where match_id = v_match.id and status = 'closed';

  if v_wins_a = 2 or v_wins_b = 2 then
    update public.matches set
      status = 'complete',
      winner_id = case when v_wins_a = 2 then v_match.participant_a else v_match.participant_b end
    where id = v_match.id;
  else
    insert into public.games (match_id, game_number)
    values (v_match.id, v_game.game_number + 1)
    on conflict (match_id, game_number) do nothing;
    update public.matches set status = 'in_progress' where id = v_match.id and status = 'pending';
  end if;
end;
$$;
