# Focus music — 2026-10-20

Seven full-length instrumental recordings by Kevin MacLeod, licensed CC BY 4.0. Official per-track sources and SHA-256 hashes are in source/tracks.json; public/music/ATTRIBUTION.txt and the Parent Music UI retain credit and license links. Audio was normalized, faded at boundaries and encoded to 96 kbps MP3. This is optional accompaniment, not a claim of improved concentration.

Default off. Parent Music selects a persisted track and offers 20-second previews. One player prevents overlap. Task and large-focus clocks have an on/off switch. Help/rest, village/parent, hidden pages and finishing pause playback. Returning to an active task resumes when enabled; browser autoplay denial exposes a manual retry. Existing completion chime remains independent. Settings and nickname survive reset and are validated in backups.

Validation: typecheck, lint (existing warnings), web export, backup model suite and isolated Chrome/CDP browser-check.mjs passed. All seven MP3s fully decoded with ffmpeg; browser analyser confirmed nonzero decoded waveforms. Tests cover previews, single-player loop, persisted choice, lifecycle, forced autoplay denial/retry, 320/390 layout and unchanged task points/history. Screenshots inspected. No physical iPhone listening test was performed. Phone background playback is intentionally paused.

Local command: node reports/focus-music/browser-check.mjs
Public command: SKY_TEST_URL=https://jshinegroup-svg.github.io/holton-guardian-app/ node reports/focus-music/browser-check.mjs

Release: source 5e789c2, Pages 457bedd, all jobs successful in run 39448890689. Public AppEntry cff4acbadf37616a57d32cc86813e1d7 verified. Both full public music and child-name browser suites PASS.
