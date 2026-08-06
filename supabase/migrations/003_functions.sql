begin;
create or replace function public.has_role(p_user_id uuid,p_role public.app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=p_user_id and role=p_role);
$$;

create or replace function public.is_staff(p_user_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=p_user_id);
$$;

create or replace function public.bootstrap_owner(p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then raise exception 'Não autorizado'; end if;
  if exists(select 1 from public.user_roles) then raise exception 'O proprietário já foi configurado'; end if;
  insert into public.user_roles(user_id,role) values(p_user_id,'owner');
end $$;

create or replace function public.search_products(search_term text,result_limit integer default 40)
returns setof public.products language sql stable security invoker set search_path=public as $$
  select p.* from public.products p
  left join public.categories c on c.id=p.category_id
  where p.status='published' and p.deleted_at is null and (
    p.search_document @@ websearch_to_tsquery('portuguese',unaccent(search_term)) or
    similarity(unaccent(p.name),unaccent(search_term)) > .18 or
    unaccent(coalesce(c.name,'')) ilike '%'||unaccent(search_term)||'%'
  )
  order by ts_rank(p.search_document,websearch_to_tsquery('portuguese',unaccent(search_term))) desc, similarity(unaccent(p.name),unaccent(search_term)) desc, p.published_at desc
  limit least(greatest(result_limit,1),100);
$$;

grant execute on function public.has_role(uuid,public.app_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.bootstrap_owner(uuid) to authenticated;
grant execute on function public.search_products(text,integer) to anon,authenticated;
commit;
