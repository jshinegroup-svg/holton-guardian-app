begin;
do $test$
declare u uuid:=gen_random_uuid(); f uuid:=gen_random_uuid(); c uuid:=gen_random_uuid();
op uuid:=gen_random_uuid(); ev uuid:=gen_random_uuid(); task uuid:=gen_random_uuid(); r jsonb;
st jsonb:='{"phase":"done","orbs":17,"focusElapsedMs":1325699915}'::jsonb;
events jsonb;
begin
insert into auth.users(id) values(u);
insert into public.families(id,owner_id) values(f,u);
insert into public.children(id,family_id,nickname,age_years) values(c,f,'sync regression',8);
perform set_config('request.jwt.claim.sub',u::text,true);
events:=jsonb_build_array(jsonb_build_object('id',ev,'kind','task_completed','occurredAt',now(),'taskId',task,'plannedSeconds',1500,'elapsedSeconds',1325699));
r:=public.save_child_progress(c,0,op,st,events);
if r->>'revision'<>'1' then raise exception 'save failed'; end if;
if not exists(select 1 from public.usage_events where id=ev and elapsed_seconds is null and elapsed_seconds_raw=1325699) then raise exception 'raw recovery failed'; end if;
if not exists(select 1 from public.child_saves where child_id=c and state=st) then raise exception 'state altered'; end if;
r:=public.save_child_progress(c,0,op,st,events);
if r->>'duplicate'<>'true' or (select count(*) from public.usage_events where child_id=c)<>1 then raise exception 'duplicate protection failed'; end if;
insert into public.usage_events(id,child_id,family_id,age_years,kind,occurred_at,elapsed_seconds) values(gen_random_uuid(),c,f,8,'task_cancelled',now(),1500);
if not exists(select 1 from public.usage_events where child_id=c and elapsed_seconds=1500 and elapsed_seconds_raw is null) then raise exception 'valid duration altered'; end if;
begin
insert into public.usage_events(id,child_id,family_id,age_years,kind,occurred_at,elapsed_seconds) values(gen_random_uuid(),c,f,8,'active_time',now(),999999);
raise exception 'non-task constraint lost';
exception when check_violation then null;
end;
perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
begin
perform public.save_child_progress(c,1,gen_random_uuid(),st,'[]');
raise exception 'authorization lost';
exception when insufficient_privilege then null;
end;
end $test$;
rollback;
