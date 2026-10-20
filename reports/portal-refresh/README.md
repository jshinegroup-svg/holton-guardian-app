# Portal preparation refresh — 2026-10-21

Jerry22885: improve circled portal; remove struck-through sentence below Task Starter heading.

Portal is code-native SVG: metallic gold arch, cyan crystal, layered glow/rings, stars and steps. Existing finite reduced-motion-aware glow retained. Translucent gold-bordered panel. Removed only “拿出 Task Starter，把需要的東西準備好。”; title, preparation/timing reminder and start button preserved. No state/data changes.

Typecheck/export PASS. Chrome320/390 tests: image fully decoded; marked copy absent; preparation retains null deadline; start sets deadline/active state; points unchanged. Screenshots inspected. First screenshot revealed an invalid MIME parameter and caught invisible SVG; corrected to charset=utf-8 and added decoded-image assertion before release.

Source daec20c; Pages47018b9; run39466761402. Public bundle matched and full public portal UI/start-timing suite PASS.
