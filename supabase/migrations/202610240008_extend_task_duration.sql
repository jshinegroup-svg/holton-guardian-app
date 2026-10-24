-- Keep existing short tasks valid; allow 999-minute planned durations.
alter table public.usage_events
  drop constraint usage_events_planned_seconds_check,
  add constraint usage_events_planned_seconds_check
    check (planned_seconds between 0 and 59940);
