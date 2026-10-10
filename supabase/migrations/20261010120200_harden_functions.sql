-- Trigger functions are never called over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_roles() from public, anon, authenticated;
revoke execute on function public.reports_before_insert() from public, anon, authenticated;
revoke execute on function public.reports_before_update() from public, anon, authenticated;
revoke execute on function public.force_unpublished() from public, anon, authenticated;
revoke execute on function public.touch_updated() from public, anon, authenticated;

-- Staff RPCs: signed-in only (each also checks permissions inside).
revoke execute on function public.crm_stats() from public, anon;
revoke execute on function public.set_user_role(uuid, text) from public, anon;
revoke execute on function public.set_user_active(uuid, boolean) from public, anon;
revoke execute on function public.decline_role_request(uuid) from public, anon;
revoke execute on function public.invite_staff(text, text) from public, anon;
revoke execute on function public.my_rank() from public, anon;
grant execute on function public.crm_stats(), public.set_user_role(uuid, text), public.set_user_active(uuid, boolean),
  public.decline_role_request(uuid), public.invite_staff(text, text), public.my_rank() to authenticated;

-- has_perm (used inside RLS policies), destination_overview and suggest_alternatives
-- stay public on purpose: they only return aggregate, published planning data.
