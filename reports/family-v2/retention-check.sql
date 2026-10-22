begin;
do $$
declare fid uuid; uid uuid; target uuid:=gen_random_uuid(); expired uuid:=gen_random_uuid(); fresh uuid:=gen_random_uuid(); baseline bigint; ts timestamptz;
begin
 select id,owner_id into fid,uid from public.families limit 1;
 select count(*) into baseline from public.children;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 insert into public.children(id,family_id,nickname) values(target,fid,'test-target'),(expired,fid,'test-expired'),(fresh,fid,'test-fresh');
 insert into public.child_saves(child_id,family_id,state) values(target,fid,'{"points":42}'),(expired,fid,'{"points":9}');
 insert into public.child_operations(operation_id,child_id,revision) values(gen_random_uuid(),target,1);
 insert into public.usage_events(id,child_id,family_id,kind,occurred_at) values(gen_random_uuid(),target,fid,'visit',now());
 begin perform public.permanently_delete_child(target);raise exception 'active deletion allowed';exception when raise_exception then if SQLERRM<>'archive_first' then raise;end if;end;
 perform public.set_child_archived(target,true); select archived_at into ts from public.children where id=target;
 if ts is null then raise exception 'missing archive timestamp';end if;
 perform public.set_child_archived(target,true);
 if (select archived_at from public.children where id=target)<>ts then raise exception 'repeat archive extended deadline';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin perform public.permanently_delete_child(target);raise exception 'foreign deletion allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.set_child_archived(target,false);
 if (select archived_at from public.children where id=target) is not null then raise exception 'restore did not clear timestamp';end if;
 perform public.set_child_archived(target,true);perform public.permanently_delete_child(target);
 if exists(select 1 from public.children where id=target) or exists(select 1 from public.child_saves where child_id=target) or exists(select 1 from public.child_operations where child_id=target) or exists(select 1 from public.usage_events where child_id=target) then raise exception 'cascade incomplete';end if;
 perform public.set_child_archived(expired,true);perform public.set_child_archived(fresh,true);
 -- Backdate only synthetic rows under transaction lock; rollback restores all changes.
 alter table public.children disable trigger children_archive_time;
 update public.children set archived_at=now()-interval '30 days' where id=expired;
 update public.children set archived_at=now()-interval '29 days 23 hours 59 minutes' where id=fresh;
 alter table public.children enable trigger children_archive_time;
 begin perform public.set_child_archived(expired,false);raise exception 'expired restored';exception when raise_exception then if SQLERRM<>'retention_expired' then raise;end if;end;
 perform public.purge_expired_child_archives();
 if exists(select 1 from public.children where id=expired) or exists(select 1 from public.child_saves where child_id=expired) then raise exception 'expired not purged';end if;
 if not exists(select 1 from public.children where id=fresh) then raise exception 'fresh purged too early';end if;
 if (select count(*) from public.children)<>baseline+1 then raise exception 'unrelated profile changed';end if;
 if has_function_privilege('authenticated','public.purge_expired_child_archives()','execute') or has_function_privilege('anon','public.permanently_delete_child(uuid)','execute') then raise exception 'privilege too broad';end if;
end $$;
rollback;
