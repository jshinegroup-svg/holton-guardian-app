-- HOLTON V2: private family data; apply only to the dedicated V2 project.
create table public.families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 1 and 20),
  age_years integer not null check (age_years between 1 and 18),
  age_recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(id, family_id)
);
create table public.child_saves (
  child_id uuid primary key,
  family_id uuid not null,
  revision bigint not null default 0 check (revision >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now(),
  foreign key(child_id, family_id) references public.children(id, family_id) on delete cascade
);
create table public.child_operations (
  operation_id uuid primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  revision bigint not null,
  created_at timestamptz not null default now()
);
create table public.usage_events (
  id uuid primary key,
  child_id uuid not null,
  family_id uuid not null,
  age_years integer not null check (age_years between 1 and 18),
  kind text not null check (kind in ('visit','task_started','task_completed','task_cancelled','card_selected','active_time')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  task_id uuid,
  card_id text check (char_length(card_id) <= 120),
  planned_seconds integer check (planned_seconds between 0 and 3600),
  elapsed_seconds integer check (elapsed_seconds between 0 and 86400),
  early_finish boolean,
  foreign key(child_id, family_id) references public.children(id, family_id) on delete cascade
);
create index children_family_idx on public.children(family_id);
create index saves_family_idx on public.child_saves(family_id);
create index operations_child_idx on public.child_operations(child_id);
create index events_family_time_idx on public.usage_events(family_id, occurred_at);
create unique index one_task_completion on public.usage_events(child_id, task_id) where kind='task_completed';

alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.child_saves enable row level security;
alter table public.child_operations enable row level security;
alter table public.usage_events enable row level security;
create policy family_read on public.families for select to authenticated using(owner_id=(select auth.uid()));
create policy family_create on public.families for insert to authenticated with check(owner_id=(select auth.uid()));
create policy children_read on public.children for select to authenticated using(exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid())));
create policy children_create on public.children for insert to authenticated with check(exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid())));
create policy children_update on public.children for update to authenticated using(exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid()))) with check(exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid())));
create policy saves_read on public.child_saves for select to authenticated using(exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid())));
create policy events_read on public.usage_events for select to authenticated using(exists(select 1 from public.families f where f.id=family_id and f.owner_id=(select auth.uid())));
-- No direct writes to saves/operations/events: one atomic RPC below owns them.
revoke all on public.child_operations from anon, authenticated;
revoke all on public.child_saves, public.usage_events from anon, authenticated;
grant select on public.child_saves, public.usage_events to authenticated;

create function public.save_child_progress(p_child_id uuid,p_expected_revision bigint,p_operation_id uuid,p_state jsonb,p_events jsonb default '[]'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.children; s public.child_saves; op public.child_operations; e jsonb; next_revision bigint;
begin
  select ch.* into c from public.children ch join public.families f on f.id=ch.family_id where ch.id=p_child_id and f.owner_id=auth.uid() for update of ch;
  if not found then raise exception 'not_authorized' using errcode='42501'; end if;
  if jsonb_typeof(p_state) is distinct from 'object' or octet_length(p_state::text)>8388608 then raise exception 'invalid_state'; end if;
  if jsonb_typeof(p_events) is distinct from 'array' then raise exception 'invalid_events'; end if;
  if jsonb_array_length(p_events)>50 then raise exception 'too_many_events'; end if;
  select * into op from public.child_operations where operation_id=p_operation_id;
  if found then
    if op.child_id<>p_child_id then raise exception 'operation_collision'; end if;
    return jsonb_build_object('revision',op.revision,'duplicate',true);
  end if;
  select * into s from public.child_saves where child_id=p_child_id;
  if coalesce(s.revision,0)<>p_expected_revision then raise exception 'revision_conflict' using errcode='40001'; end if;
  next_revision:=p_expected_revision+1;
  insert into public.child_saves(child_id,family_id,revision,state) values(c.id,c.family_id,next_revision,p_state)
    on conflict(child_id) do update set revision=excluded.revision,state=excluded.state,updated_at=now();
  for e in select value from jsonb_array_elements(p_events) loop
    insert into public.usage_events(id,child_id,family_id,age_years,kind,occurred_at,task_id,card_id,planned_seconds,elapsed_seconds,early_finish)
    values((e->>'id')::uuid,c.id,c.family_id,c.age_years,e->>'kind',(e->>'occurredAt')::timestamptz,(e->>'taskId')::uuid,e->>'cardId',(e->>'plannedSeconds')::integer,(e->>'elapsedSeconds')::integer,(e->>'earlyFinish')::boolean);
  end loop;
  insert into public.child_operations(operation_id,child_id,revision) values(p_operation_id,c.id,next_revision);
  return jsonb_build_object('revision',next_revision,'duplicate',false);
end $$;
revoke all on function public.save_child_progress(uuid,bigint,uuid,jsonb,jsonb) from public,anon;
grant execute on function public.save_child_progress(uuid,bigint,uuid,jsonb,jsonb) to authenticated;
