-- Hide archived test profiles from the family roster without deleting progress.
-- This is a roster filter, not a revocation of owner access to saved progress.
alter table public.children add column hidden_from_home boolean not null default false;
alter policy children_read on public.children using (not hidden_from_home and exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid())));
