-- 1:1 profile data for auth.users + new-user trigger + backfill

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is '1:1 profile data for auth.users.';

alter table public.profiles enable row level security;

-- updated_at auto-touch
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- RLS: own read/update + admin read all
create policy "profiles_select_own"
  on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_admin_read"
  on public.profiles for select to authenticated using (public.is_admin());

-- On new auth user: create profile + default 'user' role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill existing users
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'user' from auth.users
on conflict (user_id, role) do nothing;
