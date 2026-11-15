-- Synthetic records only; all mutations rolled back.
begin;
do $$
declare u uuid:=gen_random_uuid(); outsider uuid:=gen_random_uuid(); f uuid; other_f uuid; c uuid; other_c uuid;
begin
 insert into auth.users(id) values(u),(outsider);
 insert into public.families(owner_id) values(u) returning id into f;
 insert into public.families(owner_id) values(outsider) returning id into other_f;
 insert into public.children(family_id,nickname,age_years) values(f,'notebook-test',8) returning id into c;
 insert into public.children(family_id,nickname,age_years) values(other_f,'notebook-test-other',8) returning id into other_c;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform set_config('test.child',c::text,true);perform set_config('test.other',other_c::text,true);
 insert into storage.objects(bucket_id,name) values('homework-notebooks',other_c::text||'/2026-11-15');
end $$;
set local role authenticated;
do $$
declare n integer;
begin
 insert into storage.objects(bucket_id,name) values('homework-notebooks',current_setting('test.child')||'/2026-11-15');
 select count(*) into n from storage.objects where bucket_id='homework-notebooks';
 if n<>1 then raise exception 'cross-family read isolation failed';end if;
 update storage.objects set metadata='{"fixture":true}' where name=current_setting('test.child')||'/2026-11-15';
 get diagnostics n=row_count;if n<>1 then raise exception 'own update denied';end if;
 update storage.objects set metadata='{"fixture":true}' where name=current_setting('test.other')||'/2026-11-15';
 get diagnostics n=row_count;if n<>0 then raise exception 'cross-family update allowed';end if;
 begin
  insert into storage.objects(bucket_id,name) values('homework-notebooks',current_setting('test.other')||'/2026-11-16');
  raise exception 'cross-family insert allowed';
 exception when insufficient_privilege then null;end;
 begin
  insert into storage.objects(bucket_id,name) values('homework-notebooks',current_setting('test.child')||'/bad/path');
  raise exception 'malformed path allowed';
 exception when insufficient_privilege then null;end;
end $$;
set local role anon;
do $$ declare n integer;begin
 select count(*) into n from storage.objects where bucket_id='homework-notebooks';
 if n<>0 then raise exception 'anonymous read allowed';end if;
end $$;
reset role;
rollback;
select 'PASS: own read/write, cross-family read/insert/update denial, malformed path denial, anonymous denial; fixtures rolled back' as result;
