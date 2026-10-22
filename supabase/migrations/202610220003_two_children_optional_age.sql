alter table public.children alter column age_years drop not null;
alter table public.usage_events alter column age_years drop not null;
create or replace function public.enforce_two_children() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' and new.family_id=old.family_id then return new; end if;
 perform 1 from public.families where id=new.family_id for update;
 if (select count(*) from public.children where family_id=new.family_id)>=2 then
  raise exception 'This family already has two children. Existing profiles are preserved.';
 end if;
 return new;
end; $$;
create trigger children_max_two before insert or update of family_id on public.children for each row execute function public.enforce_two_children();
revoke all on function public.enforce_two_children() from public,anon,authenticated;
