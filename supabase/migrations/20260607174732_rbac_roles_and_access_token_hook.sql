-- RBAC: app_role enum + user_roles + custom access token hook + is_admin()

create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
comment on table public.user_roles is 'Per-user application roles for RBAC.';

alter table public.user_roles enable row level security;

-- Reads the user's role from the JWT claim injected by the access token hook.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'user_role') = 'admin', false);
$$;

-- Custom Access Token Hook: injects a top-level `user_role` claim into the JWT.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  claims jsonb;
  v_role public.app_role;
begin
  select role into v_role
  from public.user_roles
  where user_id = (event ->> 'user_id')::uuid
  limit 1;

  claims := event -> 'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(v_role::text, 'user')));
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The hook executes as the supabase_auth_admin role.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant select on table public.user_roles to supabase_auth_admin;

-- RLS policies for user_roles
create policy "user_roles_auth_admin_read"
  on public.user_roles for select to supabase_auth_admin using (true);

create policy "user_roles_select_own"
  on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);

create policy "user_roles_admin_all"
  on public.user_roles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
