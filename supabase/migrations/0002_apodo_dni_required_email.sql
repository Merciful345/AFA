-- Agrega apodo (opcional, para anunciar en el torneo) y dni (obligatorio,
-- identidad del inscripto). Email pasa a ser obligatorio.
alter table public.registrations add column apodo text;
alter table public.registrations add column dni text not null;
alter table public.registrations alter column email set not null;
