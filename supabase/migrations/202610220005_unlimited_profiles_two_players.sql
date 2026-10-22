-- Profile count is independent of the maximum two simultaneous on-screen players.
-- Preserve all children and saves; remove only the creation limit.
drop trigger if exists children_max_two on public.children;
drop function if exists public.enforce_two_children();
