# Time-card switch performance — 2026-10-21

Jerry reported slow left/right time-card artwork appearance and approved implementation.

Evidence: original7 card assets total17,356,780 bytes; six PNGs2.6–2.9MiB each. New non-destructive mobile derivatives585px long edge JPEG85 total1,010,136 bytes (~94.2% smaller); originals retained. Catalog uses derivatives. Ready-state CardPedestal mounts all7 card images once (keyed, opacity selection, nonselected accessibility hidden), triggering preload and retaining loaded components. No source mutation/download on each switch. No fade. Correct-name loading placeholder for first cold load; native onLoad marks decoded candidates. Help-card pedestal behavior retained. No timing/reward/storage algorithm changes.

Typecheck/export and isolated Chrome tests PASS: all7 downloaded once,14 switches forward/back offline with no additional card requests; 15–17ms local rendered switch; correct ID/minutes persisted, reload, prepare and unchanged points;320/390 screenshots inspected. Measurement is desktop Chrome, not physical iPhone. Initial network download still required.
