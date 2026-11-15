-- Private attachments, separate from progress/rewards. No existing rows changed.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('homework-notebooks','homework-notebooks',false,8388608,
 array['image/jpeg','image/png','image/webp','application/pdf']);

create policy homework_notebooks_read on storage.objects for select to authenticated
using (bucket_id='homework-notebooks' and exists (
 select 1 from public.children c join public.families f on f.id=c.family_id
 where c.id::text=split_part(name,'/',1) and f.owner_id=(select auth.uid()) and not c.hidden_from_home));
create policy homework_notebooks_insert on storage.objects for insert to authenticated
with check (bucket_id='homework-notebooks' and name ~ '^[0-9a-f-]{36}/[0-9]{4}-[0-9]{2}-[0-9]{2}$' and exists (
 select 1 from public.children c join public.families f on f.id=c.family_id
 where c.id::text=split_part(name,'/',1) and f.owner_id=(select auth.uid()) and not c.hidden_from_home));
create policy homework_notebooks_update on storage.objects for update to authenticated
using (bucket_id='homework-notebooks' and exists (
 select 1 from public.children c join public.families f on f.id=c.family_id
 where c.id::text=split_part(name,'/',1) and f.owner_id=(select auth.uid()) and not c.hidden_from_home))
with check (bucket_id='homework-notebooks' and name ~ '^[0-9a-f-]{36}/[0-9]{4}-[0-9]{2}-[0-9]{2}$' and exists (
 select 1 from public.children c join public.families f on f.id=c.family_id
 where c.id::text=split_part(name,'/',1) and f.owner_id=(select auth.uid()) and not c.hidden_from_home));
-- No public access, signed public links or client delete policy.
