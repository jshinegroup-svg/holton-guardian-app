# Guardian playhouse / four music groups — 2026-11-22

Authorized by Jerry: add all 20 proposed tracks as Piano and Calm ambient groups, retain the existing two groups, and begin integrating the complete guardian home into Adventure Squad.

- Entry: village → companions → guardian playhouse. Full-screen same-origin iframe with microphone permission, return to village unmounts it.
- Retains original home2 artwork, audio and gameplay (ball, brush, feeding/joy, bell, music box, rooms, actions, hold-to-record/release-to-play/9-second cap). Imported original assets and five voice clips are byte-identical.
- No AI or speech-recognition integration; recording stays in the frame. No changes to task/reward/cloud data contracts. Room decoration/sound preference remains browser-local, not per-child cloud progress.
- Four groups of ten songs; original IDs and selections retained. New full-length recordings converted to 96kbps MP3 with -23 LUFS target and fades; official sources and CC BY4 attribution in music files' attribution and reports/music-four-groups.
- Main-app music and onboarding overlay suppressed while home is open. Closing iframe releases active microphone tracks (tested).
- Offline worker serves home HTML instead of main-app HTML for the embedded navigation. Full optional offline package now ~406 MB; normal playback is on demand.

Validation:
- TypeScript and web export passed.
- Synthetic family fixtures at 390×844 and 1024×900: actual entry, rendered original face, room switching, ball, feeding/joy, fixed speech, hold recording/replay, return, all four categories and new-group audio playback; no page errors or changes to fixture child saves.
- Active microphone tracks end when frame closes.
- Browser offline reload of playhouse and its assets passed without recursive main app.
- ffprobe validates all 20 new full-length recordings against official durations (within 10s). 40 tracks total.
- Physical iPhone Safari not tested in this environment; user acceptance still needed.

Production verification: Render deploy dep-dc17j1l9fdbs73a1k470 is Live at commit a979dd5. The same synthetic-family browser checks passed against https://holton-family-v2.onrender.com at390/1024, including mic release on close and unchanged child saves. All20 new media HEAD responses and byte lengths verified.

## iPhone scrolling correction — user 24668
- Removed room-wide pan suppression. Background, pet and tap-only controls allow vertical scrolling; ball, apple, brush, bell and hold microphone retain gesture locking. Touch fallback checks the gesture origin, so moving off a prop stays locked without global state.
- Bumped embedded page/CSS/touch-guard versions. Build passed; mobile CDP gestures verify background scrolling, all four prop locks, and scrolling after cancellation. Existing 390/1024 integration checks pass (feed, ball, recording, exit and unchanged saves). Physical iPhone acceptance remains pending.

Live verification: Render dep-dc181556e07s73cjkr70 deployed 1001101 at 13:43 Taipei. Hosted 390/1024 integration and real CDP touch gestures PASS, including background scroll, four prop locks, cancellation recovery and unchanged fixture saves.

## All eight companion species — user 24671
- Pip, HOP, BOMO, Tidefin, Stoneback, Emberwing, Steel Eagle and Bramblefang supported. Seven new reference-derived six-pose atlases; original Stoneback art/face renderer unchanged. References, prompts and saved paths in companion-assets.json. New derivative art is not pixel-identical original art or a full 3D rig.
- Each species has its own food contact location, atlas, facing and existing reviewed fixed voice clips. Non-Stoneback renderer uses keyed atlas poses with small jaw deformation; no fake Stoneback face over other bodies.
- Child roster contains their selected starter plus species of owned guardian cards. Default follows current task companion. Switching inside home is session-only and never mutates task companion, cards, points or evolution. Species use their base home appearance; four card evolution appearances remain untouched, not newly animated in this scope.
- A question about all-species free-play vs owned-only received no response during implementation; conservative owned-only default stated to user. All species can be exercised with synthetic fixtures without changing real accounts.
- Typecheck/build pass. Eight-species actual CDP touch tests pass feeding, brushing, ball, bell, rooms, music, fixed speech and hold/release recording; roster filtering/fallback/reload switching pass. 390/1024 integrated synthetic-family checks pass with unchanged child saves and microphone cleanup. Screenshots inspected. Physical iPhone visual/gesture acceptance remains pending.

Rollout follow-up: first hosted main-app test briefly loaded the previous app bundle while the new assets were already live, omitting roster query. Recheck confirmed new bundle passes roster. Hardened missing-roster fallback to legacy Stoneback-only instead of all species; all-species tests now pass an explicit fixture roster.
