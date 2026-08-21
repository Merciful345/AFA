alter table public.voters add column password_hash text;
update public.voters set password_hash = '' where password_hash is null;
alter table public.voters alter column password_hash set not null;
