-- Existing archived profiles receive a full 30-day window from this migration.
alter table public.children add column archived_at timestamptz;
update public.children set archived_at=now() where hidden_from_home;
create function public.track_child_archive_time() returns trigger language plpgsql set search_path='' as $$
begin
 if not new.hidden_from_home then new.archived_at=null;
 elsif TG_OP='INSERT' then new.archived_at=now();
 elsif not old.hidden_from_home then new.archived_at=now();
 else new.archived_at=old.archived_at; end if;
 return new;
end $$;
create trigger children_archive_time before insert or update on public.children for each row execute function public.track_child_archive_time();
alter table public.children add constraint archive_time_matches_state check(hidden_from_home=(archived_at is not null));
create or replace function public.set_child_archived(p_child_id uuid,p_archived boolean)
returns void language plpgsql security definer set search_path='' as $$
declare c public.children;
begin
 select ch.* into c from public.children ch join public.families f on f.id=ch.family_id where ch.id=p_child_id and f.owner_id=auth.uid() for update of ch;
 if not found then raise exception 'not_authorized' using errcode='42501'; end if;
 if p_archived is null then raise exception 'invalid_archive_state'; end if;
 if not p_archived and c.archived_at<=now()-interval '30 days' then raise exception 'retention_expired'; end if;
 if not p_archived and exists(select 1 from public.children ch where ch.family_id=c.family_id and ch.id<>c.id and not ch.hidden_from_home and ch.nickname=c.nickname) then raise exception 'duplicate_nickname'; end if;
 update public.children set hidden_from_home=p_archived where id=c.id;
end $$;
drop function public.list_archived_children();
create function public.list_archived_children()
returns table(id uuid,nickname text,expires_at timestamptz) language sql stable security definer set search_path='' as $$
 select c.id,c.nickname,c.archived_at+interval '30 days' from public.children c join public.families f on f.id=c.family_id where f.owner_id=auth.uid() and c.hidden_from_home order by c.archived_at;
$$;
create function public.permanently_delete_child(p_child_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare c public.children;
begin
 select ch.* into c from public.children ch join public.families f on f.id=ch.family_id where ch.id=p_child_id and f.owner_id=auth.uid() for update of ch;
 if not found then raise exception 'not_authorized' using errcode='42501'; end if;
 if not c.hidden_from_home then raise exception 'archive_first'; end if;
 delete from public.children where id=c.id;
end $$;
create function public.purge_expired_child_archives() returns bigint language plpgsql security definer set search_path='' as $$
declare n bigint;
begin
 delete from public.children where hidden_from_home and archived_at<=now()-interval '30 days';
 get diagnostics n=row_count; return n;
end $$;
revoke all on function public.list_archived_children(),public.permanently_delete_child(uuid),public.purge_expired_child_archives(),public.track_child_archive_time() from public,anon,authenticated;
grant execute on function public.list_archived_children(),public.permanently_delete_child(uuid) to authenticated;
create extension if not exists pg_cron;
select cron.schedule('holton-purge-child-archives','17 * * * *','select public.purge_expired_child_archives();');
