-- handle_new_user is a trigger-only function; it must not be callable via PostgREST RPC.
-- Triggers still fire after revoking EXECUTE from API roles.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
