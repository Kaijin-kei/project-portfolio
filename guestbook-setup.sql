create table public.guestbook_notes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 40),
  message text not null check (length(trim(message)) between 1 and 240),
  created_at timestamptz not null default now()
);

alter table public.guestbook_notes enable row level security;

revoke all on table public.guestbook_notes from anon, authenticated;
grant select, insert on table public.guestbook_notes to anon;

create policy "Visitors can read notes"
on public.guestbook_notes for select
to anon using (true);

create policy "Visitors can post notes"
on public.guestbook_notes for insert
to anon with check (
  length(trim(name)) between 1 and 40
  and length(trim(message)) between 1 and 240
);
