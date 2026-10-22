-- Reversible roster removal. Progress rows and their revisions are never changed.
create or replace function public.set_child_archived(p_child_id uuid,p_archived boolean)
returns void language plpgsql security definer set search_path='' as $$
declare c public.children;
begin
 select ch.* into c from public.children ch join public.families f on f.id=ch.family_id where ch.id=p_child_id and f.owner_id=auth.uid() for update of ch;
 if not found then raise exception 'not_authorized' using errcode='42501'; end if;
 if p_archived is null then raise exception 'invalid_archive_state'; end if;
 if not p_archived and exists(select 1 from public.children ch where ch.family_id=c.family_id and ch.id<>c.id and not ch.hidden_from_home and ch.nickname=c.nickname) then raise exception 'duplicate_nickname'; end if;
 update public.children set hidden_from_home=p_archived where id=c.id;
end $$;
create or replace function public.list_archived_children()
returns table(id uuid,nickname text) language sql stable security definer set search_path='' as $$
 select c.id,c.nickname from public.children c join public.families f on f.id=c.family_id where f.owner_id=auth.uid() and c.hidden_from_home order by c.created_at;
$$;
revoke all on function public.set_child_archived(uuid,boolean),public.list_archived_children() from public,anon;
grant execute on function public.set_child_archived(uuid,boolean),public.list_archived_children() to authenticated;
