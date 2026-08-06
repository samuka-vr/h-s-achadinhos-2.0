begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-media','product-media',true,20971520,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "public product media read" on storage.objects for select using(bucket_id='product-media');
create policy "staff product media insert" on storage.objects for insert to authenticated with check(bucket_id='product-media' and (public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')));
create policy "staff product media update" on storage.objects for update to authenticated using(bucket_id='product-media' and public.is_staff(auth.uid())) with check(bucket_id='product-media' and public.is_staff(auth.uid()));
create policy "staff product media delete" on storage.objects for delete to authenticated using(bucket_id='product-media' and (public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin')));
commit;
