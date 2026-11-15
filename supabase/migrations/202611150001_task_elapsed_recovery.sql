-- Telemetry must not roll back a valid progress save from older clients.
-- Keep out-of-range task durations as raw evidence, not fabricated focus time.
alter table public.usage_events add column elapsed_seconds_raw integer;
create function public.normalize_task_elapsed() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.kind in ('task_completed','task_cancelled')
     and (new.elapsed_seconds < 0 or new.elapsed_seconds > 86400) then
    new.elapsed_seconds_raw := new.elapsed_seconds;
    new.elapsed_seconds := null;
  end if;
  return new;
end $$;
revoke all on function public.normalize_task_elapsed() from public, anon, authenticated;
create trigger normalize_task_elapsed_before_insert
before insert on public.usage_events
for each row execute function public.normalize_task_elapsed();
comment on column public.usage_events.elapsed_seconds_raw is
'Invalid legacy task duration; elapsed_seconds is NULL when duration is unknown. Never include raw values in focus totals.';

