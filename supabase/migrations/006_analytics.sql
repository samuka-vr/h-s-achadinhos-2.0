begin;
create or replace function public.analytics_summary(p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare result jsonb;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Não autorizado'; end if;
  with bounds as (select now()-(least(greatest(p_days,1),365)||' days')::interval as since),
  totals as (
    select
      (select count(*) from public.analytics_sessions,bounds where first_seen_at>=bounds.since)::int sessions,
      (select count(*) from public.analytics_events,bounds where created_at>=bounds.since and event_type='page_view')::int page_views,
      (select count(*) from public.analytics_events,bounds where created_at>=bounds.since and event_type='outbound_click')::int outbound_clicks
  ),
  daily as (
    select jsonb_agg(row_to_json(x) order by x.day) value from (
      select to_char(d.day,'YYYY-MM-DD') day,
        (select count(*) from public.analytics_sessions s where s.first_seen_at>=d.day and s.first_seen_at<d.day+interval '1 day')::int sessions,
        (select count(*) from public.analytics_events e where e.created_at>=d.day and e.created_at<d.day+interval '1 day' and e.event_type='page_view')::int page_views,
        (select count(*) from public.analytics_events e where e.created_at>=d.day and e.created_at<d.day+interval '1 day' and e.event_type='outbound_click')::int outbound_clicks
      from generate_series(current_date-(least(greatest(p_days,1),365)-1),current_date,interval '1 day') d(day)
    ) x
  ),
  top_products as (
    select coalesce(jsonb_agg(row_to_json(x) order by x.clicks desc),'[]'::jsonb) value from (
      select p.name,p.public_code,count(*)::int clicks from public.analytics_events e join public.products p on p.id=e.product_id,bounds where e.created_at>=bounds.since and e.event_type='outbound_click' group by p.id order by clicks desc limit 20
    ) x
  )
  select jsonb_build_object('sessions',t.sessions,'page_views',t.page_views,'outbound_clicks',t.outbound_clicks,'daily',coalesce(d.value,'[]'::jsonb),'top_products',tp.value) into result from totals t cross join daily d cross join top_products tp;
  return result;
end $$;
grant execute on function public.analytics_summary(integer) to authenticated;
commit;
