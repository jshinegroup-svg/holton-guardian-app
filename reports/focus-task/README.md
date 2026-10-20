# Task-first focus mode and minimum completion time

Jerry22824 requested a quiet task-centered screen and a disabled gray completion button until half the timed duration or ten minutes for an untimed task.

Task title is now central (36px), static plain background replaces scenery while actively focusing, large guardian/time cards are absent; a small companion remains below controls. Time is secondary. Help remains enabled. Completion is gray/disabled, then teal/enabled with an explanation, never automatic. Preparation/completion/collections/village retain their art.

Persisted focusElapsedMs + focusStartedAt count active task time, including app background/screen-off time (the child can work away from the screen), excluding help/rest and finishing. Reload resumes the same interval. Finishing requires a fresh timestamp eligibility check in addition to disabled UI. Return-to-task keeps accumulated time; new preparation/start resets it. Old timed tasks infer elapsed from their deadline/remaining. Old untimed tasks lacked a start timestamp, so start tracking on first upgraded load. Existing old finishing phase remains finishable. This is a local timer, not attention detection or a tamper-proof ledger.

Backup validator accepts and validates the new optional timing fields; old backups stay compatible. No wallet/prices/reward amounts/world/companion changes.

Tests: pure exact millisecond boundaries for 0/5/10/15/20/30/40/60 minutes, pause/resume, clock-backward clamp, migration, new backup roundtrip and invalid fields; existing family-backup model checks. Browser tests isolate synthetic storage, 320/390 quiet layout, real start/disabled click, reload, timed and untimed live threshold crossing/color change, help/rest, finish/return, double-click single reward, migrations, long title wrapping. No physical phone claim.
