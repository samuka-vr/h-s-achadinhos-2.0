begin;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.banners enable row level security;
alter table public.user_roles enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.import_jobs enable row level security;
alter table public.audit_logs enable row level security;

create policy "site settings public read" on public.site_settings for select using(true);
create policy "site settings admins update" on public.site_settings for update to authenticated using(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin')) with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin'));

create policy "categories public read active" on public.categories for select using(active or public.is_staff(auth.uid()));
create policy "categories staff insert" on public.categories for insert to authenticated with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "categories staff update" on public.categories for update to authenticated using(public.is_staff(auth.uid())) with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "categories admins delete" on public.categories for delete to authenticated using(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin'));

create policy "products public read published" on public.products for select using((status='published' and deleted_at is null) or public.is_staff(auth.uid()));
create policy "products staff insert" on public.products for insert to authenticated with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "products staff update" on public.products for update to authenticated using(public.is_staff(auth.uid())) with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "products admins delete" on public.products for delete to authenticated using(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin'));

create policy "media public read" on public.product_media for select using(exists(select 1 from public.products p where p.id=product_id and ((p.status='published' and p.deleted_at is null) or public.is_staff(auth.uid()))));
create policy "media staff manage" on public.product_media for all to authenticated using(public.is_staff(auth.uid())) with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create policy "banners public read active" on public.banners for select using(active or public.is_staff(auth.uid()));
create policy "banners staff manage" on public.banners for all to authenticated using(public.is_staff(auth.uid())) with check(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create policy "roles own or staff read" on public.user_roles for select to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid()));
create policy "roles owner insert" on public.user_roles for insert to authenticated with check(public.has_role(auth.uid(),'owner'));
create policy "roles owner update" on public.user_roles for update to authenticated using(public.has_role(auth.uid(),'owner')) with check(public.has_role(auth.uid(),'owner'));
create policy "roles owner delete" on public.user_roles for delete to authenticated using(public.has_role(auth.uid(),'owner') and user_id<>auth.uid());

create policy "analytics staff read sessions" on public.analytics_sessions for select to authenticated using(public.is_staff(auth.uid()));
create policy "analytics staff read events" on public.analytics_events for select to authenticated using(public.is_staff(auth.uid()));
create policy "imports staff read" on public.import_jobs for select to authenticated using(public.is_staff(auth.uid()));
create policy "imports staff insert" on public.import_jobs for insert to authenticated with check(created_by=auth.uid() and public.is_staff(auth.uid()));
create policy "imports staff update" on public.import_jobs for update to authenticated using(created_by=auth.uid() or public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin'));
create policy "audit staff read" on public.audit_logs for select to authenticated using(public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin'));
commit;
