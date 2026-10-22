-- Administrators are provisioned manually after the owner registers; clients cannot self-promote.
create table public.app_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.app_admins enable row level security;
revoke all on public.app_admins from anon, authenticated;
create function public.record_usage_event(p_child_id uuid,p_id uuid,p_kind text,p_elapsed_seconds integer default null)
returns void language plpgsql security definer set search_path='' as $$
declare c public.children;
begin
 select ch.* into c from public.children ch join public.families f on f.id=ch.family_id where ch.id=p_child_id and f.owner_id=auth.uid();
 if not found then raise exception 'not_authorized' using errcode='42501'; end if;
 if p_kind not in ('visit','active_time') then raise exception 'invalid_event_kind'; end if;
 if p_kind='active_time' and (p_elapsed_seconds is null or p_elapsed_seconds<1 or p_elapsed_seconds>60) then raise exception 'invalid_active_time'; end if;
 insert into public.usage_events(id,child_id,family_id,age_years,kind,occurred_at,elapsed_seconds)
 values(p_id,c.id,c.family_id,c.age_years,p_kind,now(),p_elapsed_seconds) on conflict(id) do nothing;
end $$;
revoke all on function public.record_usage_event(uuid,uuid,text,integer) from public, anon;
grant execute on function public.record_usage_event(uuid,uuid,text,integer) to authenticated;
create function public.usage_summary(p_all_families boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'not_authorized' using errcode='42501'; end if;
 if p_all_families and not exists(select 1 from public.app_admins where user_id=auth.uid()) then raise exception 'admin_only' using errcode='42501'; end if;
 with scoped as (
 select e.* from public.usage_events e join public.families f on f.id=e.family_id
 where (p_all_families or f.owner_id=auth.uid()) and e.occurred_at>=now()-interval '30 days'
 ), ages as (
 select age_years,count(distinct family_id) families,count(distinct child_id) children,
 count(*) filter(where kind='task_started') started,
 count(*) filter(where kind='task_completed') completed,
 count(*) filter(where kind='task_started' and exists(select 1 from public.usage_events done where done.child_id=scoped.child_id and done.task_id=scoped.task_id and done.kind='task_completed')) cohort_completed,
 count(*) filter(where kind='task_completed' and early_finish) early_completed,
 coalesce(sum(elapsed_seconds) filter(where kind='task_completed'),0) task_seconds,
 coalesce(sum(elapsed_seconds) filter(where kind='active_time'),0) screen_seconds
 from scoped group by age_years
 ), cards as (
 select card_id,count(*) filter(where kind='card_selected') selections,count(*) filter(where kind='task_started') tasks
 from scoped where card_id is not null group by card_id
 ), visits as (
 select child_id,count(distinct (occurred_at at time zone 'Asia/Taipei')::date) days from scoped where kind='visit' group by child_id
 ) select jsonb_build_object('days',30,'ages',coalesce((select jsonb_agg(ages order by age_years) from ages),'[]'::jsonb),
 'cards',coalesce((select jsonb_agg(cards order by selections desc,tasks desc) from cards),'[]'::jsonb),
 'returning_children',(select count(*) from visits where days>=2),'active_children',(select count(*) from visits)) into result;
 return result;
end $$;
revoke all on function public.usage_summary(boolean) from public, anon;
grant execute on function public.usage_summary(boolean) to authenticated;
