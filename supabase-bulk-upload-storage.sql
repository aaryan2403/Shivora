-- Run after supabase-bulk-upload-drafts.sql; do not run on production before review.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,8388608,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do nothing;
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_admin() and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images" on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_admin());
