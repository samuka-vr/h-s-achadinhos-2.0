begin;

create or replace function public.analytics_summary(
  p_days integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  safe_days integer := least(greatest(coalesce(p_days, 30), 1), 365);
begin
  if not public.is_staff(auth.uid()) then
    raise exception 'Não autorizado';
  end if;

  with bounds as (
    select now() - (safe_days * interval '1 day') as since
  ),
  totals as (
    select
      (
        select count(*)
        from public.analytics_sessions s, bounds b
        where s.first_seen_at >= b.since
      )::int as sessions,

      (
        select count(*)
        from public.analytics_events e, bounds b
        where e.created_at >= b.since
          and e.event_type = 'page_view'
      )::int as page_views,

      (
        select count(*)
        from public.analytics_events e, bounds b
        where e.created_at >= b.since
          and e.event_type = 'outbound_click'
      )::int as outbound_clicks
  ),
  daily as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'day', to_char(d.bucket_day, 'YYYY-MM-DD'),

          'sessions', (
            select count(*)
            from public.analytics_sessions s
            where s.first_seen_at >= d.bucket_day
              and s.first_seen_at < d.bucket_day + interval '1 day'
          )::int,

          'page_views', (
            select count(*)
            from public.analytics_events e
            where e.created_at >= d.bucket_day
              and e.created_at < d.bucket_day + interval '1 day'
              and e.event_type = 'page_view'
          )::int,

          'outbound_clicks', (
            select count(*)
            from public.analytics_events e
            where e.created_at >= d.bucket_day
              and e.created_at < d.bucket_day + interval '1 day'
              and e.event_type = 'outbound_click'
          )::int
        )
        order by d.bucket_day
      ),
      '[]'::jsonb
    ) as value
    from generate_series(
      (current_date - (safe_days - 1))::timestamp,
      current_date::timestamp,
      interval '1 day'
    ) as d(bucket_day)
  ),
  top_products as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'name', x.name,
          'public_code', x.public_code,
          'clicks', x.clicks
        )
        order by x.clicks desc
      ),
      '[]'::jsonb
    ) as value
    from (
      select
        p.name,
        p.public_code,
        count(*)::int as clicks
      from public.analytics_events e
      join public.products p on p.id = e.product_id
      cross join bounds b
      where e.created_at >= b.since
        and e.event_type = 'outbound_click'
      group by p.id, p.name, p.public_code
      order by clicks desc
      limit 20
    ) x
  )
  select jsonb_build_object(
    'sessions', t.sessions,
    'page_views', t.page_views,
    'outbound_clicks', t.outbound_clicks,
    'daily', d.value,
    'top_products', tp.value
  )
  into result
  from totals t
  cross join daily d
  cross join top_products tp;

  return result;
end;
$$;

revoke all on function public.analytics_summary(integer) from public;
grant execute on function public.analytics_summary(integer) to authenticated;

commit;
