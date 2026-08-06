begin;
create or replace function public.purge_old_analytics()
returns integer language plpgsql security definer set search_path=public as $$
declare deleted_count integer;
begin
  delete from public.analytics_events where created_at < now()-interval '90 days';
  get diagnostics deleted_count = row_count;
  delete from public.analytics_sessions s where s.last_seen_at < now()-interval '90 days' and not exists(select 1 from public.analytics_events e where e.session_id=s.id);
  return deleted_count;
end $$;
revoke all on function public.purge_old_analytics() from public;
comment on function public.purge_old_analytics() is 'Executar diariamente via Supabase Cron/pg_cron com papel privilegiado.';
commit;
