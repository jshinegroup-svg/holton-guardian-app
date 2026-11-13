create table public.homework_recognition_requests (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 fingerprint text not null, created_at timestamptz not null default now(), result jsonb,
 unique(owner_id,fingerprint)
);
alter table public.homework_recognition_requests enable row level security;
revoke all on public.homework_recognition_requests from anon,authenticated;
create function public.reserve_homework_recognition(p_owner uuid,p_fingerprint text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare existing public.homework_recognition_requests; n integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
 delete from public.homework_recognition_requests where owner_id=p_owner and created_at < now()-interval '1 day';
 select * into existing from public.homework_recognition_requests where owner_id=p_owner and fingerprint=p_fingerprint;
 if found then return jsonb_build_object('status',case when existing.result is null then 'pending' else 'cached' end,'result',existing.result); end if;
 select count(*) into n from public.homework_recognition_requests where owner_id=p_owner;
 if n>=20 then return jsonb_build_object('status','limit'); end if;
 insert into public.homework_recognition_requests(owner_id,fingerprint) values(p_owner,p_fingerprint);
 return jsonb_build_object('status','reserved');
end $$;
revoke all on function public.reserve_homework_recognition(uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_homework_recognition(uuid,text) to service_role;
