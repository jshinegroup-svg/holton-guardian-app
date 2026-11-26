# Alpha focus integration — 2026-11-26

Jerry authorized adding his prepared original-recording 20-minute loop first in Focus and as the initial selection across homework and general tasks (Telegram 24845).

- Source: Healing & Meditation, https://www.youtube.com/watch?v=yyNbADmnNWA . This is NOT an original composition or one of the Kevin MacLeod CC BY tracks. No independent redistribution license verification is recorded.
- Audio: public/music/alpha20.mp3; SHA1 55576fa0922d97182095d9342a36d318a782a6a2; 19,200,863 bytes; stereo 48kHz/128kbps; 1200 seconds; source seconds 60–1268, 8-second tail/head crossfade. Original file delivered earlier via Drive.
- Shared LightApp controller covers homework, regular tasks and dual view. Existing music off/on preference is preserved; no forced autoplay. Older selections resolve to Alpha without an automatic cloud progress write. Later user selections save focusMusicSelectionVersion=1 and remain respected. Backup schema accepts that marker.
- 41 total tracks; Focus 11. Remaining tracks retained. Credits and source link distinguish Alpha from existing 40 CC BY recordings.
- On-demand music cache preserved, no music included in automatic offline package. The selected Alpha is downloaded once and cached by hash; updates do not invalidate unchanged tracks.
- Typecheck and export passed. Local actual-media homework and regular-task tests passed including off/on and near-end loop wrap; homework help pause/resume passed. Synthetic family fixtures only; no real family records modified.
- Vercel connector deployment: preview dpl_8XmFzsJXZYtWAPbqeQTQFEGbqVpW. Preview promote API returned 422; created production deployment dpl_9fuWerRJpQFLbShpxmnTPLcyTns1 instead. READY and alias https://holton-family-v2.vercel.app/ verified. Existing project prj_dB9o55PEXrEcaqLGKffObSIrHF6e / team_UD85oDJsGBX6zbqS85cnSD1x; no paid change.
- Uploaded six changed files by SHA1 using Vercel upload_file; reused existing assets, no re-upload of the old music library. Prebuilt deployment config retains cache headers, omits buildCommand/outputDirectory.
- Hosted manifest, service worker, playhouse and Alpha bytes exactly match build; 41 music hashes; Alpha range, offline replay and suffix fetch pass. Actual iPhone listening and perceptual seamlessness remain device acceptance checks.
- Hosted synthetic-family homework and regular-task actual-media tests passed (Alpha src, duration1200, loop wrap, switches; homework help/resume). Settings UI test passed first-of11/default and later manual choice persisting across reload, at both fixture widths. Initial settings test expected the child picker on reload; corrected fixture to account for persisted child selection.
